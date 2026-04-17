import { publicImageUrl, supabase } from "./supabase";

const root: HTMLDivElement = (() => {
  const el = document.querySelector("#app");
  if (!(el instanceof HTMLDivElement)) throw new Error("#app missing");
  return el;
})();

const BASE_HREF = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/** Shown next to Buy; keep in sync with your Stripe Price amount. */
const PRODUCT_PRICE_EUR = 69.99;
const productPriceDisplay = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
}).format(PRODUCT_PRICE_EUR);

type View = "landing" | "product" | "email" | "thanks" | "admin";

/** Chosen photo file until submitted on /email */
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

/** Same document as home; scroll product block into view */
function scrollToProduct(behavior: ScrollBehavior): void {
  requestAnimationFrame(() => {
    document.getElementById("product")?.scrollIntoView({ behavior, block: "start" });
  });
}

function goEmail(): void {
  history.pushState(null, "", `${BASE_HREF}email`);
  render();
}

function goThanks(): void {
  history.replaceState(null, "", `${BASE_HREF}thanks`);
  render();
}

function homeHtml(): string {
  return `
    <div class="home-shell">
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

    <div class="page-product" id="product">
      <main class="product-layout">
        <div class="product-shots-wrap">
          <div
            class="product-shots"
            id="product-shots"
            role="region"
            aria-roledescription="carousel"
            aria-label="Product photos"
            tabindex="0"
          >
            <figure class="product-shot">
              <img
                src="${BASE_HREF}product-box-set.jpg"
                width="819"
                height="1024"
                alt="BLACKBIRD gift box with four anti-dandruff products"
                decoding="async"
              />
            </figure>
            <figure class="product-shot">
              <img
                src="${BASE_HREF}hero-lineup.png"
                width="920"
                height="575"
                alt="BLACKBIRD product lineup"
                decoding="async"
              />
            </figure>
          </div>
          <div class="product-shots-dots" id="product-shots-dots" role="tablist" aria-label="Choose photo">
            <button type="button" class="product-shots-dot is-active" role="tab" aria-selected="true" aria-label="Photo 1 of 2" data-slide="0" id="product-dot-0"></button>
            <button type="button" class="product-shots-dot" role="tab" aria-selected="false" aria-label="Photo 2 of 2" data-slide="1" id="product-dot-1"></button>
          </div>
        </div>

        <aside class="product-side" aria-label="Product details">
          <div class="product-panel product-panel--buy">
            <p class="product-price">${escapeHtml(productPriceDisplay)}</p>
            <button type="button" class="btn-buy" id="buy-btn">Buy now</button>
          </div>

          <div class="product-panel product-panel--upload">
            <div class="product-expert" id="hair-analysis">
              <p class="product-expert__label">Expert scalp check</p>
              <p class="product-expert__hint">Upload a picture of your head with dandruff visible, and we will tell you what dandruff type you have.</p>
              <button
                type="button"
                class="btn-upload-expert"
                id="pick-photo"
                aria-label="Choose a photo to upload"
              >
                Upload picture
              </button>
              <input type="file" id="file" class="visually-hidden" accept="image/*" />
            </div>
          </div>
        </aside>
      </main>
    </div>
    </div>
  `;
}

function emailHtml(): string {
  return `
    <div class="page-step page-email">
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
    history.replaceState(null, "", `${BASE_HREF}#product`);
    view = "landing";
  }

  if (view === "landing" || view === "product") {
    root.innerHTML = homeHtml();
    bindLanding();
    bindProduct();
    const scrollProduct =
      view === "product" || (view === "landing" && location.hash === "#product");
    if (scrollProduct) {
      scrollToProduct(view === "product" ? "auto" : "smooth");
    }
  } else if (view === "email") root.innerHTML = emailHtml();
  else if (view === "thanks") root.innerHTML = thanksHtml();
  else root.innerHTML = adminHtml();

  if (view === "email") bindEmail();
  else if (view === "thanks") bindThanks();
  else if (view === "admin") bindAdmin();
}

function bindLanding(): void {
  document.querySelector("#cta-now")?.addEventListener("click", () => {
    history.pushState(null, "", `${BASE_HREF}#product`);
    scrollToProduct("smooth");
  });
}

function bindProduct(): void {
  document.querySelector("#buy-btn")?.addEventListener("click", () => {
    void startStripeCheckout();
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

  bindProductShotsCarousel();
}

function bindProductShotsCarousel(): void {
  const scroller = document.querySelector<HTMLDivElement>("#product-shots");
  const dots = document.querySelectorAll<HTMLButtonElement>("#product-shots-dots .product-shots-dot");
  const slides = scroller?.querySelectorAll<HTMLElement>(".product-shot");
  if (!scroller || !slides?.length || dots.length !== slides.length) return;

  const syncDots = (): void => {
    const w = scroller.clientWidth;
    if (w <= 0) return;
    const idx = Math.min(slides.length - 1, Math.round(scroller.scrollLeft / w));
    dots.forEach((dot, i) => {
      const on = i === idx;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    });
  };

  scroller.addEventListener("scroll", syncDots, { passive: true });
  syncDots();

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const slide = slides[i];
      if (!slide) return;
      scroller.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    });
  });

  scroller.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const w = scroller.clientWidth;
    const idx = Math.round(scroller.scrollLeft / w);
    const next =
      e.key === "ArrowRight" ? Math.min(slides.length - 1, idx + 1) : Math.max(0, idx - 1);
    const slide = slides[next];
    if (slide) scroller.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  });
}

async function startStripeCheckout(): Promise<void> {
  const btn = document.querySelector<HTMLButtonElement>("#buy-btn");
  const fallback = import.meta.env.VITE_STRIPE_PAYMENT_LINK?.trim();

  const setBusy = (busy: boolean): void => {
    btn?.toggleAttribute("disabled", busy);
    btn?.classList.toggle("is-loading", busy);
  };

  setBusy(true);
  try {
    const url = `${BASE_HREF}api/create-checkout-session`;
    const res = await fetch(url, { method: "POST" });
    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (res.ok && data?.url) {
      window.location.href = data.url;
      return;
    }
    if (fallback) {
      window.location.href = fallback;
      return;
    }
    const msg = data?.error ?? `Checkout failed (${res.status})`;
    window.alert(msg);
  } catch {
    if (fallback) {
      window.location.href = fallback;
      return;
    }
    window.alert("Could not reach checkout. Run `vercel dev` locally or deploy with Stripe env vars.");
  } finally {
    setBusy(false);
  }
}

function bindEmail(): void {
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
