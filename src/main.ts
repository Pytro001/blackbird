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

type View = "landing" | "product" | "thanks";

const DEFAULT_WA_MESSAGE = "Hi";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function whatsappPrefillText(): string {
  return (import.meta.env.VITE_WHATSAPP_MESSAGE?.trim() || DEFAULT_WA_MESSAGE).trim();
}

function whatsappDigits(): string {
  return (import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
}

/** Full wa.me URL, or null if the number is not configured. */
function whatsappChatUrl(): string | null {
  const digits = whatsappDigits();
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(whatsappPrefillText())}`;
}

function whatsAppBlockHtml(): string {
  const url = whatsappChatUrl();
  const cta = url
    ? `<a class="product-wa-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`
    : `<span class="product-wa-link product-wa-link--disabled">WhatsApp</span>`;

  return `
            <div class="product-wa" id="hair-analysis">
              <p class="product-wa-line">${cta}</p>
              <div class="product-wa-qr">
                <img
                  src="${BASE_HREF}whatsapp-qr.jpg"
                  width="1024"
                  height="1024"
                  alt=""
                  decoding="async"
                  loading="lazy"
                  class="product-wa-qr__img"
                />
              </div>
            </div>`;
}

function getAppPath(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
  let path = location.pathname.replace(/\/$/, "") || "/";
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || "/";
  }
  if (!path.startsWith("/")) path = `/${path}`;
  return path;
}

function pathToView(): View {
  const path = getAppPath();
  if (path === "/product") return "product";
  if (path === "/thanks") return "thanks";
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
            <p class="product-inline-msg product-inline-msg--error" id="buy-error" hidden></p>
            ${whatsAppBlockHtml()}
          </div>
        </aside>
      </main>
    </div>
    </div>
  `;
}

function thanksHtml(): string {
  return `
    <div class="page-step page-thanks">
      <main class="step-main">
        <h2 class="step-title">Thank you</h2>
        <p class="step-lede">Your order is confirmed.</p>
        <button type="button" class="btn-pill" id="thanks-home">Home</button>
      </main>
    </div>
  `;
}

function render(): void {
  const path = getAppPath();
  if (path === "/email") {
    history.replaceState(null, "", `${BASE_HREF}#product`);
  } else if (path === "/admin" || path.startsWith("/admin/")) {
    history.replaceState(null, "", BASE_HREF);
  }

  const view = pathToView();

  if (view === "landing" || view === "product") {
    root.innerHTML = homeHtml();
    bindLanding();
    bindProduct();
    const scrollProduct =
      view === "product" || (view === "landing" && location.hash === "#product");
    if (scrollProduct) {
      scrollToProduct(view === "product" ? "auto" : "smooth");
    }
  } else if (view === "thanks") root.innerHTML = thanksHtml();

  if (view === "thanks") bindThanks();
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
  const errEl = document.querySelector<HTMLParagraphElement>("#buy-error");
  const fallback = import.meta.env.VITE_STRIPE_PAYMENT_LINK?.trim();

  const setBuyError = (msg: string): void => {
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.hidden = !msg;
  };

  const setBusy = (busy: boolean): void => {
    btn?.toggleAttribute("disabled", busy);
    btn?.classList.toggle("is-loading", busy);
  };

  setBuyError("");
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
    setBuyError(data?.error ?? `Checkout failed (${res.status}).`);
  } catch {
    if (fallback) {
      window.location.href = fallback;
      return;
    }
    setBuyError("Could not reach checkout. Check deployment and Stripe env vars.");
  } finally {
    setBusy(false);
  }
}

function bindThanks(): void {
  document.querySelector("#thanks-home")?.addEventListener("click", () => {
    goLanding();
  });
}

window.addEventListener("popstate", () => {
  render();
});

render();
