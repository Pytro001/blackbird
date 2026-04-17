const root: HTMLDivElement = (() => {
  const el = document.querySelector("#app");
  if (!(el instanceof HTMLDivElement)) throw new Error("#app missing");
  return el;
})();

const API_URL = (import.meta.env.VITE_SCALP_CHECK_URL ?? "").trim();
const FIELD_NAME = (import.meta.env.VITE_SCALP_FIELD_NAME ?? "image").trim() || "image";

const BASE_HREF = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

type ParsedScalp = {
  scalpType: "dry" | "oily" | "unknown";
  suitableForSet: boolean | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function stringFromUnknown(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

function inferScalpType(obj: Record<string, unknown>): "dry" | "oily" | "unknown" {
  const keys = [
    "scalpType",
    "type",
    "dandruffType",
    "classification",
    "result",
    "label",
  ] as const;
  for (const k of keys) {
    const s = stringFromUnknown(obj[k]);
    if (s) {
      const low = s.toLowerCase();
      if (low.includes("dry")) return "dry";
      if (low.includes("oily")) return "oily";
    }
  }
  const nested = obj.data ?? obj.result;
  if (isRecord(nested)) return inferScalpType(nested);
  return "unknown";
}

function inferSuitable(obj: Record<string, unknown>): boolean | null {
  if ("suitableForSet" in obj) {
    const v = obj.suitableForSet;
    if (typeof v === "boolean") return v;
  }
  if ("suitable" in obj) {
    const v = obj.suitable;
    if (typeof v === "boolean") return v;
  }
  const st = inferScalpType(obj);
  if (st === "dry") return true;
  if (st === "oily") return false;
  return null;
}

function parseApiPayload(data: unknown): ParsedScalp {
  if (!isRecord(data)) {
    return { scalpType: "unknown", suitableForSet: null };
  }
  return {
    scalpType: inferScalpType(data),
    suitableForSet: inferSuitable(data),
  };
}

function checkIcon(ok: boolean): string {
  if (ok) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
}

function scalpDots(active: "dry" | "oily" | "unknown"): string {
  const dryOn = active === "dry";
  const oilyOn = active === "oily";
  return `
    <div class="scalp-indicator" aria-hidden="true">
      <span class="scalp-dot dry ${dryOn ? "active dry" : ""}"></span>
      <span class="scalp-dot oily ${oilyOn ? "active oily" : ""}"></span>
    </div>
  `;
}

function renderResult(payload: {
  parsed: ParsedScalp;
  rawJson: string | null;
  showRaw: boolean;
}): string {
  const { parsed, rawJson, showRaw } = payload;
  const suitable = parsed.suitableForSet;
  const showCheck = suitable === true || suitable === false;
  const color =
    suitable === true
      ? "var(--result-yes)"
      : suitable === false
        ? "var(--result-no)"
        : "var(--muted)";

  let visual = "";
  if (showCheck) {
    visual = `
      <div class="result-visual" style="color: ${color}">
        ${checkIcon(suitable === true)}
      </div>
    `;
  } else if (parsed.scalpType !== "unknown") {
    visual = scalpDots(parsed.scalpType);
  }

  const rawBlock =
    showRaw && rawJson
      ? `<pre class="result-raw" role="status">${escapeHtml(rawJson)}</pre>`
      : "";

  return `
    <div class="result">
      ${visual}
      ${rawBlock}
    </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pathToView(): "landing" | "product" {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
  let path = location.pathname.replace(/\/$/, "") || "/";
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;
  return path === "/product" ? "product" : "landing";
}

function goLanding(): void {
  history.replaceState(null, "", BASE_HREF);
  render();
}

function goProduct(): void {
  history.pushState(null, "", `${BASE_HREF}product`);
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
        <button type="button" class="btn-pill" id="cta-shop">Shop</button>
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

      <main class="product-main">
        <figure class="product-shot">
          <img
            src="${BASE_HREF}hero-lineup.png"
            width="920"
            height="575"
            alt=""
            decoding="async"
          />
        </figure>

        <div class="product-panel">
          <button type="button" class="btn-buy" id="buy-btn">Buy</button>
          <button type="button" class="btn-secondary" id="btn-analyze">Hair analysis</button>
          <p class="refund-note">We refund if it’s not your hair type.</p>
        </div>

        <section id="hair-analysis" class="product-upload" aria-labelledby="analysis-heading">
          <h2 class="product-upload__label" id="analysis-heading">Hair analysis</h2>
          <button type="button" class="dropzone dropzone--compact" id="dz" aria-label="Upload scalp photo">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M8 32V38C8 39.1046 8.89543 40 10 40H38C39.1046 40 40 39.1046 40 38V32" />
              <path d="M24 8V30M24 8L17 15M24 8L31 15" />
            </svg>
          </button>
          <input type="file" id="file" class="visually-hidden" accept="image/*" />
          <p class="hint" id="hint"></p>
          <div id="out"></div>
        </section>
      </main>
    </div>
  `;
}

function render(): void {
  const view = pathToView();
  root.innerHTML = view === "landing" ? landingHtml() : productHtml();
  if (view === "landing") {
    bindLanding();
  } else {
    bindProduct();
  }
}

function bindLanding(): void {
  document.querySelector("#cta-shop")?.addEventListener("click", () => {
    goProduct();
  });
}

function bindProduct(): void {
  document.querySelector("#back-btn")?.addEventListener("click", () => {
    goLanding();
  });

  document.querySelector("#buy-btn")?.addEventListener("click", () => {
    /* Stripe Checkout will plug in here */
  });

  document.querySelector("#btn-analyze")?.addEventListener("click", () => {
    document
      .querySelector("#hair-analysis")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const dzEl = document.querySelector<HTMLButtonElement>("#dz");
  const fileInput = document.querySelector<HTMLInputElement>("#file");
  const hintEl = document.querySelector<HTMLParagraphElement>("#hint");
  const outEl = document.querySelector<HTMLDivElement>("#out");
  if (!dzEl || !fileInput || !hintEl || !outEl) return;

  const uploadBtn = dzEl;
  const hintP = hintEl;
  const outBox = outEl;

  function setLoading(loading: boolean): void {
    uploadBtn.classList.toggle("loading", loading);
    uploadBtn.disabled = loading;
  }

  function setHint(text: string): void {
    hintP.textContent = text;
    hintP.hidden = !text;
  }

  async function analyzeFile(file: File): Promise<void> {
    outBox.innerHTML = "";
    if (!API_URL) {
      setHint("Set VITE_SCALP_CHECK_URL in .env");
      return;
    }

    setLoading(true);
    setHint("");

    try {
      const body = new FormData();
      body.append(FIELD_NAME, file);

      const res = await fetch(API_URL, {
        method: "POST",
        body,
      });

      const text = await res.text();
      let data: unknown = text;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }

      const parsed = parseApiPayload(data);
      const pretty = JSON.stringify(data, null, 2);
      const showRaw =
        !res.ok ||
        parsed.scalpType === "unknown" ||
        parsed.suitableForSet === null;

      outBox.innerHTML = renderResult({
        parsed,
        rawJson: pretty,
        showRaw,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      outBox.innerHTML = `<pre class="result-raw" role="alert">${escapeHtml(msg)}</pre>`;
    } finally {
      setLoading(false);
    }
  }

  uploadBtn.addEventListener("click", () => fileInput.click());

  uploadBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });

  ["dragenter", "dragover"].forEach((ev) => {
    uploadBtn.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadBtn.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((ev) => {
    uploadBtn.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadBtn.classList.remove("dragover");
    });
  });

  uploadBtn.addEventListener("drop", (e) => {
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type.startsWith("image/")) void analyzeFile(f);
  });

  fileInput.addEventListener("change", () => {
    const f = fileInput.files?.[0];
    if (f) void analyzeFile(f);
    fileInput.value = "";
  });

  if (!API_URL) {
    setHint("Set VITE_SCALP_CHECK_URL in .env");
  }
}

window.addEventListener("popstate", () => {
  render();
});

render();
