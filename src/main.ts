import { publicImageUrl, supabase } from "./supabase";

const root: HTMLDivElement = (() => {
  const el = document.querySelector("#app");
  if (!(el instanceof HTMLDivElement)) throw new Error("#app missing");
  return el;
})();

const BASE_HREF = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

type View = "landing" | "product" | "email" | "thanks" | "admin";

/** Holds the image chosen on /product until submitted on /email */
let pendingUploadFile: File | null = null;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pathToView(): View {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
  let path = location.pathname.replace(/\/$/, "") || "/";
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;
  if (path === "/product") return "product";
  if (path === "/email") return "email";
  if (path === "/thanks") return "thanks";
  if (path === "/admin" || path.startsWith("/admin/")) return "admin";
  return "landing";
}

function goLanding(): void {
  history.replaceState(null, "", BASE_HREF);
  render();
}

function goProduct(): void {
  history.pushState(null, "", `${BASE_HREF}product`);
  render();
}

function goEmail(): void {
  history.pushState(null, "", `${BASE_HREF}email`);
  render();
}

function goThanks(): void {
  history.replaceState(null, "", `${BASE_HREF}thanks`);
  render();
}

function landingHtml(): string {
  return `
    <section class="hero-editorial">
      <div class="hero-editorial__title-wrap">
        <h1 class="hero-editorial__title">
          blackbird<sup class="hero-editorial__reg" aria-label="registered">®</sup>
        </h1>
      </div>
      <div class="hero-editorial__bottom">
        <p class="hero-editorial__script">remove dandruff forever</p>
        <button type="button" class="btn-pill" id="cta-now">Now</button>
      </div>
    </section>
  `;
}

function productHtml(): string {
  return `
    <div class="page-product">
      <button type="button" class="back-btn back-btn--solo" id="back-btn" aria-label="Back to home">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>

      <main class="product-layout">
        <figure class="product-shot">
          <img
            src="${BASE_HREF}hero-lineup.png"
            width="920"
            height="575"
            alt=""
            decoding="async"
          />
        </figure>

        <aside class="product-side" aria-label="Product details">
          <div class="product-panel">
            <button type="button" class="btn-buy" id="buy-btn">Buy</button>

            <div class="product-expert" id="hair-analysis">
              <p class="product-expert__label">Expert scalp check</p>
              <p class="product-expert__hint">Upload a picture of your head with dandruff visible, and we will tell you what dandruff type you have.</p>
              <button
                type="button"
                class="btn-upload-expert"
                id="pick-photo"
                aria-label="Choose a photo to upload"
              >
                Upload photo
              </button>
              <input type="file" id="file" class="visually-hidden" accept="image/*" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  `;
}

function emailHtml(): string {
  return `
    <div class="page-step page-email">
      <button type="button" class="back-btn back-btn--solo" id="email-back" aria-label="Back">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
      </button>
      <main class="step-main">
        <h2 class="step-title">Your email</h2>
        <p class="step-lede">We’ll send your scalp check result to this email.</p>
        <div class="email-preview" id="email-preview"></div>
        <form class="email-form" id="email-form" novalidate>
          <label class="field-label" for="email-input">Email</label>
          <input type="email" class="field-input" id="email-input" name="email" required autocomplete="email" placeholder="you@example.com" />
          <p class="form-error" id="email-error" hidden></p>
          <button type="submit" class="btn-buy" id="email-submit">Send</button>
        </form>
      </main>
    </div>
  `;
}

function thanksHtml(): string {
  return `
    <div class="page-step page-thanks">
      <main class="step-main">
        <h2 class="step-title">You’re on the list</h2>
        <p class="step-lede">We’ll email your result as soon as it’s ready.</p>
        <button type="button" class="btn-pill" id="thanks-home">Home</button>
      </main>
    </div>
  `;
}

function adminHtml(): string {
  return `
    <div class="page-admin">
      <header class="admin-header">
        <h1 class="admin-title">Admin</h1>
        <div class="admin-auth" id="admin-auth-mount"></div>
      </header>
      <div class="admin-body" id="admin-body"></div>
    </div>
  `;
}

function render(): void {
  let view = pathToView();
  if (view === "email" && !pendingUploadFile) {
    history.replaceState(null, "", `${BASE_HREF}product`);
    view = "product";
  }

  if (view === "landing") root.innerHTML = landingHtml();
  else if (view === "product") root.innerHTML = productHtml();
  else if (view === "email") root.innerHTML = emailHtml();
  else if (view === "thanks") root.innerHTML = thanksHtml();
  else root.innerHTML = adminHtml();

  if (view === "landing") bindLanding();
  else if (view === "product") bindProduct();
  else if (view === "email") bindEmail();
  else if (view === "thanks") bindThanks();
  else bindAdmin();
}

function bindLanding(): void {
  document.querySelector("#cta-now")?.addEventListener("click", () => {
    goProduct();
  });
}

function bindProduct(): void {
  document.querySelector("#back-btn")?.addEventListener("click", () => {
    goLanding();
  });

  document.querySelector("#buy-btn")?.addEventListener("click", () => {
    /* Stripe Checkout later */
  });

  const pick = document.querySelector<HTMLButtonElement>("#pick-photo");
  const fileInput = document.querySelector<HTMLInputElement>("#file");
  if (!pick || !fileInput) return;

  pick.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    const f = fileInput.files?.[0];
    fileInput.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    pendingUploadFile = f;
    goEmail();
  });
}

function bindEmail(): void {
  document.querySelector("#email-back")?.addEventListener("click", () => {
    pendingUploadFile = null;
    history.replaceState(null, "", `${BASE_HREF}product`);
    render();
  });

  const preview = document.querySelector<HTMLDivElement>("#email-preview");
  const form = document.querySelector<HTMLFormElement>("#email-form");
  const input = document.querySelector<HTMLInputElement>("#email-input");
  const err = document.querySelector<HTMLParagraphElement>("#email-error");
  if (!preview || !form || !input || !err || !pendingUploadFile) return;

  const url = URL.createObjectURL(pendingUploadFile);
  preview.innerHTML = `<img src="${url}" alt="" class="email-preview__img" />`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.hidden = true;
    err.textContent = "";

    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = "Enter a valid email.";
      err.hidden = false;
      return;
    }

    if (!supabase) {
      err.textContent = "Submission is not configured. Add Supabase keys in .env.";
      err.hidden = false;
      return;
    }

    const file = pendingUploadFile;
    if (!file) return;

    const submitBtn = document.querySelector<HTMLButtonElement>("#email-submit");
    submitBtn?.setAttribute("disabled", "true");

    try {
      const id = crypto.randomUUID();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExt = ext.match(/^(jpe?g|png|webp|heic)$/) ? ext : "jpg";
      const path = `${id}.${safeExt}`;

      const { error: upErr } = await supabase.storage.from("scalp-uploads").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("scalp_submissions").insert({
        id,
        email: email.toLowerCase(),
        image_path: path,
        scalp_result: "pending",
      });
      if (insErr) throw insErr;

      URL.revokeObjectURL(url);
      pendingUploadFile = null;
      goThanks();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      err.textContent = msg;
      err.hidden = false;
    } finally {
      submitBtn?.removeAttribute("disabled");
    }
  });
}

function bindThanks(): void {
  document.querySelector("#thanks-home")?.addEventListener("click", () => {
    goLanding();
  });
}

type SubmissionRow = {
  id: string;
  email: string;
  image_path: string;
  created_at: string;
};

async function renderAdminDashboard(container: HTMLElement): Promise<void> {
  if (!supabase) {
    container.innerHTML = `<p class="admin-msg">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env</p>`;
    return;
  }

  const { data, error } = await supabase
    .from("scalp_submissions")
    .select("id, email, image_path, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = `<p class="admin-msg">${escapeHtml(error.message)}</p>`;
    return;
  }

  const rows = (data ?? []) as SubmissionRow[];
  if (rows.length === 0) {
    container.innerHTML = `<p class="admin-msg">No submissions yet.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="admin-grid">
      ${rows
        .map((r) => {
          const imgUrl = publicImageUrl(r.image_path);
          const em = escapeHtml(r.email);
          const when = escapeHtml(new Date(r.created_at).toLocaleString());
          return `
        <article class="admin-card" data-id="${escapeHtml(r.id)}">
          <div class="admin-card__img-wrap">
            <img class="admin-card__img" src="${escapeHtml(imgUrl)}" alt="" loading="lazy" />
          </div>
          <div class="admin-card__meta">
            <p class="admin-card__email">${em}</p>
            <p class="admin-card__date">${when}</p>
          </div>
        </article>`;
        })
        .join("")}
    </div>
  `;
}

function bindAdmin(): void {
  const mount = document.querySelector<HTMLDivElement>("#admin-auth-mount");
  const body = document.querySelector<HTMLDivElement>("#admin-body");
  if (!mount || !body) return;

  if (!supabase) {
    mount.innerHTML = "";
    body.innerHTML = `<p class="admin-msg">Configure Supabase in .env to use the dashboard.</p>`;
    return;
  }

  const sb = supabase;

  const renderAuth = async (): Promise<void> => {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      mount.innerHTML = `
        <span class="admin-user">${escapeHtml(session.user.email ?? "")}</span>
        <button type="button" class="btn-secondary btn-admin-logout" id="admin-logout">Sign out</button>
      `;
      mount.querySelector("#admin-logout")?.addEventListener("click", async () => {
        await sb.auth.signOut();
        render();
      });
      body.innerHTML = `<div class="admin-loading" id="admin-list">Loading…</div>`;
      const listEl = document.querySelector<HTMLDivElement>("#admin-list");
      if (listEl) await renderAdminDashboard(listEl);
    } else {
      mount.innerHTML = `
        <form class="admin-login-form" id="admin-login-form">
          <input class="field-input" type="email" id="adm-email" required placeholder="Admin email" autocomplete="username" />
          <input class="field-input" type="password" id="adm-pass" required placeholder="Password" autocomplete="current-password" />
          <button type="submit" class="btn-buy">Sign in</button>
        </form>
      `;
      body.innerHTML = `<p class="admin-msg">Sign in to review uploads.</p>`;
      document.querySelector("#admin-login-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const em = (document.querySelector("#adm-email") as HTMLInputElement).value.trim();
        const pw = (document.querySelector("#adm-pass") as HTMLInputElement).value;
        const { error } = await sb.auth.signInWithPassword({ email: em, password: pw });
        if (error) {
          alert(error.message);
          return;
        }
        render();
      });
    }
  };

  void renderAuth();
}

window.addEventListener("popstate", () => {
  render();
});

render();
