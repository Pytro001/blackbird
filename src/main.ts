import { PageFlip } from "page-flip";

const root: HTMLDivElement = (() => {
  const el = document.querySelector("#app");
  if (!(el instanceof HTMLDivElement)) throw new Error("#app missing");
  return el;
})();

const BASE_HREF = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

const MANUAL_PAGE_COUNT = 7;
const MANUAL_PAGE_VER = "1";

let manualPageFlip: PageFlip | null = null;

const PRODUCT_SHOTS_AUTO_MS = 5000;
let productShotsAutoTimer: ReturnType<typeof setInterval> | null = null;

function clearProductShotsAuto(): void {
  if (productShotsAutoTimer !== null) {
    clearInterval(productShotsAutoTimer);
    productShotsAutoTimer = null;
  }
}

/** Default Stripe Payment Link when Checkout API is unavailable (local dev, or API error). */
const DEFAULT_STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/7sY14o2uDdBI0UE6Dtfbq02";

/** Shown next to Buy; keep in sync with your Stripe Price amount. */
const PRODUCT_PRICE_EUR = 69.99;
const productPriceDisplay = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
}).format(PRODUCT_PRICE_EUR);

type View = "landing" | "product" | "thanks" | "manual";

/** Dermatologist Analysis WhatsApp (number + prefilled message). */
const WHATSAPP_CHAT_URL =
  "https://wa.me/4917644429908?text=Hi%2C%20this%20is%20the%20Dermatologist%20Analysis%20WhatsApp%20channel.%0AHere%20you%20can%20get%20an%20instant%20check%20to%20find%20out%20if%20you%20have%20oily%20or%20dry%20dandruff%2C%20so%20you%20get%20the%20right%20product%20for%20your%20scalp.%20Please%20send%203%20clear%20pictures%20of%20your%20head%20and%20scalp%20where%20the%20dandruff%20is%20visible%20in%20this%20chat.%0AYou%E2%80%99ll%20receive%20an%20immediate%20analysis%20from%20a%20dermatology-trained%20Teamember%20telling%20you%20exactly%20what%20type%20of%20dandruff%20you%20have.%0AFeel%20free%20to%20ask%20any%20other%20questions%20here%20too%20-%20just%20like%20you%20would%20to%20a%20friend.%0ABest%2C%20Your%20Blackbird%20Team";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Next calendar day at 12:45 local (24h express ETA display). */
function latestDeliveryDate(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(12, 45, 0, 0);
  return d;
}

function formatShippingEtaLine(delivery: Date): string {
  const datePart = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(delivery);
  return `Arrival: ${datePart}, 12:45`;
}

function updateProductShippingEta(): void {
  const eta = formatShippingEtaLine(latestDeliveryDate());
  const el = document.querySelector("#product-shipping-eta");
  if (el) el.textContent = eta;
}

function whatsAppBlockHtml(): string {
  return `
            <div class="product-wa-block" id="hair-analysis">
              <div class="product-wa-row">
                <div class="product-wa-text">
                  <p class="product-wa-headline">Get a free Dermatologist Check</p>
                  <p class="product-wa-desc">
                    Message us on
                    <a class="product-wa-link" href="${escapeHtml(WHATSAPP_CHAT_URL)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    to start.
                  </p>
                </div>
                <div class="product-wa-qr-column" aria-hidden="true">
                  <img
                    src="${BASE_HREF}whatsapp-qr.jpg?v=2"
                    width="1024"
                    height="1024"
                    alt=""
                    decoding="async"
                    loading="lazy"
                    class="product-wa-qr__img"
                  />
                </div>
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
  if (path === "/how-to-use") return "manual";
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
            aria-label="Product photos, auto-advancing. Use arrow keys to move."
            tabindex="0"
          >
            <figure class="product-shot">
              <img
                src="${BASE_HREF}product-slide-01.png"
                width="1024"
                height="819"
                alt="BLACKBIRD — Daily Wash, After Wash, and Before Sleep bottles"
                decoding="async"
              />
            </figure>
            <figure class="product-shot">
              <img
                src="${BASE_HREF}product-slide-02.png"
                width="1024"
                height="819"
                alt="BLACKBIRD After Wash — daily flake-free spray"
                decoding="async"
              />
            </figure>
            <figure class="product-shot">
              <img
                src="${BASE_HREF}product-slide-03.png"
                width="1024"
                height="819"
                alt="BLACKBIRD Before Sleep — overnight care spray"
                decoding="async"
              />
            </figure>
            <figure class="product-shot">
              <img
                src="${BASE_HREF}product-slide-04.png"
                width="1024"
                height="819"
                alt="BLACKBIRD gift set — four products in presentation box"
                decoding="async"
              />
            </figure>
          </div>
        </div>

        <aside class="product-side" aria-label="Product details">
          <div class="product-panel product-panel--buy">
            <h2 class="product-name">Blackbird Dandruff Set</h2>
            <p class="product-price">${escapeHtml(productPriceDisplay)}</p>
            <div class="product-shipping">
              <p class="product-shipping__lead" id="product-shipping-lead">24h express shipping</p>
              <p class="product-shipping__eta" id="product-shipping-eta" aria-live="polite"></p>
            </div>
            <button type="button" class="btn-buy" id="buy-btn">Buy now</button>
            <p class="product-inline-msg product-inline-msg--error" id="buy-error" hidden></p>
            <p class="product-flake-note" role="note">
              These products are for dry-flakes, if you are not sure if you have dry or oily flakes
              <a href="#hair-analysis" class="product-wa-link">WhatsApp</a> us.
            </p>
            ${whatsAppBlockHtml()}
          </div>
          <div class="product-panel product-panel--howto">
            <h3 class="product-howto__title">How to use BlackBird</h3>
            <div class="product-howto__row">
              <a class="product-howto__link product-howto__link--primary" id="product-howto-guide" href="${BASE_HREF}how-to-use">Flip-through guide</a>
              <a
                class="product-howto__link"
                href="${BASE_HREF}blackbird_user_manual.pdf"
                download="blackbird_user_manual.pdf"
              >Download PDF</a>
            </div>
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

function manualPageUrls(): string[] {
  return Array.from({ length: MANUAL_PAGE_COUNT }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `${BASE_HREF}manual/page-${n}.svg?v=${MANUAL_PAGE_VER}`;
  });
}

function destroyManualPageFlip(): void {
  if (!manualPageFlip) return;
  try {
    manualPageFlip.destroy();
  } catch {
    /* stale */
  }
  manualPageFlip = null;
}

function manualHtml(): string {
  return `
    <div class="manual-page">
      <header class="manual-header">
        <a href="${BASE_HREF}" class="manual-back">Back</a>
      </header>
      <div class="manual-stage" id="manual-stage" tabindex="0" aria-label="Usage comic, click to turn pages">
        <div id="manual-book-host" class="manual-book-host"></div>
        <div class="manual-intro" id="manual-intro" role="button" tabindex="0" aria-label="How to use BlackBird — click anywhere to start">
          <img class="manual-intro__preview" src="${BASE_HREF}manual/page-01.svg?v=${MANUAL_PAGE_VER}" alt="" width="600" height="800" decoding="async" />
          <div class="manual-intro__dim" aria-hidden="true"></div>
          <div class="manual-intro__copy">
            <h2 class="manual-intro__title">How to use BlackBird</h2>
            <p class="manual-intro__hint">Click anywhere to start</p>
          </div>
        </div>
        <div class="manual-end" id="manual-end" hidden>
          <p class="manual-end__lede">Ready to try blackbird®?</p>
          <a class="manual-end__cta" href="${BASE_HREF}#product">Get your set</a>
          <button type="button" class="manual-end__again btn-pill" id="manual-restart">Start again</button>
        </div>
        <div class="manual-progress" id="manual-progress" aria-live="polite" hidden>1 / 7</div>
      </div>
    </div>`;
}

function updateManualProgressDisplay(idx: number): void {
  const progress = document.getElementById("manual-progress");
  if (progress) progress.textContent = `${idx + 1} / ${MANUAL_PAGE_COUNT}`;
}

let manualEndTapInstalled = false;

function removeManualEndTap(): void {
  document.querySelector(".manual-end-tap")?.remove();
  manualEndTapInstalled = false;
}

function installManualEndTapOnce(): void {
  if (manualEndTapInstalled) return;
  manualEndTapInstalled = true;
  const stage = document.getElementById("manual-stage");
  if (!stage) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "manual-end-tap";
  btn.setAttribute("aria-label", "Continue");
  stage.appendChild(btn);
  btn.addEventListener(
    "click",
    () => {
      document.getElementById("manual-end")?.removeAttribute("hidden");
      btn.remove();
      manualEndTapInstalled = false;
    },
    { once: true }
  );
}

function startManualBook(): void {
  const intro = document.getElementById("manual-intro");
  const host = document.getElementById("manual-book-host");
  const progress = document.getElementById("manual-progress");
  if (!host || manualPageFlip) return;

  intro?.classList.add("manual-intro--hide");
  setTimeout(() => intro?.remove(), 380);

  const pageFlip = new PageFlip(host, {
    width: 450,
    height: 600,
    size: "stretch",
    minWidth: 240,
    maxWidth: 560,
    minHeight: 320,
    maxHeight: 720,
    flippingTime: 680,
    maxShadowOpacity: 0.45,
    showCover: false,
    mobileScrollSupport: true,
    usePortrait: true,
    drawShadow: true,
    startPage: 0,
    clickEventForward: false,
    showPageCorners: false,
  });

  manualPageFlip = pageFlip;
  pageFlip.loadFromImages(manualPageUrls());

  pageFlip.on("init", () => {
    progress?.removeAttribute("hidden");
    updateManualProgressDisplay(pageFlip.getCurrentPageIndex());
  });

  pageFlip.on("flip", () => {
    const idx = pageFlip.getCurrentPageIndex();
    removeManualEndTap();
    updateManualProgressDisplay(idx);
    if (idx === MANUAL_PAGE_COUNT - 1) installManualEndTapOnce();
  });
}

function manualStageKeydown(e: KeyboardEvent): void {
  if (!manualPageFlip) return;
  if (document.getElementById("manual-end")?.hasAttribute("hidden") === false) return;
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    manualPageFlip.flipNext("top");
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    manualPageFlip.flipPrev("top");
  }
}

function bindManual(): void {
  const intro = document.getElementById("manual-intro");
  const go = (): void => {
    intro?.removeEventListener("click", go);
    intro?.removeEventListener("keydown", onIntroKey);
    startManualBook();
  };
  const onIntroKey = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };
  intro?.addEventListener("click", go);
  intro?.addEventListener("keydown", onIntroKey);

  document.getElementById("manual-restart")?.addEventListener("click", () => {
    destroyManualPageFlip();
    removeManualEndTap();
    history.replaceState(null, "", `${BASE_HREF}how-to-use`);
    root.innerHTML = manualHtml();
    bindManual();
  });

  document.getElementById("manual-stage")?.addEventListener("keydown", manualStageKeydown);
}

function render(): void {
  clearProductShotsAuto();
  destroyManualPageFlip();
  removeManualEndTap();
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
  } else if (view === "manual") {
    root.innerHTML = manualHtml();
    bindManual();
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

  document.querySelector("#product-howto-guide")?.addEventListener("click", (e: Event) => {
    const me = e as MouseEvent;
    if (me.button !== 0 || me.metaKey || me.ctrlKey || me.shiftKey || me.altKey) return;
    me.preventDefault();
    history.pushState(null, "", `${BASE_HREF}how-to-use`);
    render();
  });

  bindProductShotsCarousel();
  updateProductShippingEta();
}

function bindProductShotsCarousel(): void {
  const scroller = document.querySelector<HTMLDivElement>("#product-shots");
  const slides = scroller?.querySelectorAll<HTMLElement>(".product-shot");
  if (!scroller || !slides?.length) return;

  let pauseAuto = false;

  const slideIndex = (): number => {
    const w = scroller.clientWidth;
    if (w <= 0) return 0;
    return Math.min(slides.length - 1, Math.round(scroller.scrollLeft / w));
  };

  const goToIndex = (idx: number, behavior: ScrollBehavior): void => {
    const slide = slides[idx];
    if (!slide) return;
    scroller.scrollTo({ left: slide.offsetLeft, behavior });
  };

  const advanceAuto = (): void => {
    if (pauseAuto || document.visibilityState !== "visible") return;
    const idx = slideIndex();
    const next = (idx + 1) % slides.length;
    goToIndex(next, "smooth");
  };

  productShotsAutoTimer = setInterval(advanceAuto, PRODUCT_SHOTS_AUTO_MS);

  scroller.addEventListener("mouseenter", () => {
    pauseAuto = true;
  });
  scroller.addEventListener("mouseleave", () => {
    pauseAuto = false;
  });
  scroller.addEventListener("focusin", () => {
    pauseAuto = true;
  });
  scroller.addEventListener("focusout", () => {
    pauseAuto = false;
  });

  scroller.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const idx = slideIndex();
    const next =
      e.key === "ArrowRight" ? Math.min(slides.length - 1, idx + 1) : Math.max(0, idx - 1);
    goToIndex(next, "smooth");
  });
}

async function startStripeCheckout(): Promise<void> {
  const btn = document.querySelector<HTMLButtonElement>("#buy-btn");
  const errEl = document.querySelector<HTMLParagraphElement>("#buy-error");
  const fallback =
    import.meta.env.VITE_STRIPE_PAYMENT_LINK?.trim() || DEFAULT_STRIPE_PAYMENT_LINK;

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
