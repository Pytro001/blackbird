import { PageFlip } from "page-flip";

const root: HTMLDivElement = (() => {
  const el = document.querySelector("#app");
  if (!(el instanceof HTMLDivElement)) throw new Error("#app missing");
  return el;
})();

const BASE_HREF = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/** Root-anchored public/ URL so images load on `/product` and other SPA paths (relative URLs would break). */
function publicAssetUrl(path: string): string {
  const p = path.replace(/^\/+/, "");
  const base = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
  return base ? `${base}/${p}`.replace(/([^:]\/)\/+/g, "$1") : `/${p}`;
}

const MANUAL_PAGE_COUNT = 7;
const MANUAL_PAGE_VER = "1";

/** Product image carousel: three slides (files in public/). */
const PRODUCT_CAROUSEL_SLIDES: readonly { file: string; alt: string }[] = [
  {
    file: "product-slide-01.png",
    alt: "BLACKBIRD: Daily Wash, After Wash, and Before Sleep bottles",
  },
  {
    file: "product-slide-02.png",
    alt: "BLACKBIRD After Wash: daily flake-free spray",
  },
  {
    file: "product-slide-03.png",
    alt: "BLACKBIRD Before Sleep: overnight care spray",
  },
];

/** 5-point star (clip-path), not circles — many quiet static specks (separate from the click star) */
function cosmosFieldDustMotesHtml(): string {
  const n = 88;
  return Array.from({ length: n }, (_, i) => {
    const left = 2 + (i * 19 + (i * i) % 17) % 90;
    const top = 1 + (i * 23 + (i * 13) % 19) % 92;
    return `      <div class="cosmos-field__mote" style="--dl:${left}%;--dt:${top}%;"></div>`;
  }).join("\n");
}

/**
 * Pop “shine” (subtle) — [left, top, delay, duration] — more entries = busier field
 */
const COSMOS_POPSTARS: ReadonlyArray<readonly [string, string, string, string]> = [
  ["4%", "12%", "0.2s", "5.8s"],
  ["18%", "8%", "1.1s", "4.2s"],
  ["32%", "22%", "0.5s", "6.4s"],
  ["51%", "6%", "2.3s", "3.1s"],
  ["67%", "19%", "1.6s", "5.1s"],
  ["11%", "38%", "0.8s", "4.7s"],
  ["86%", "14%", "0s", "6.0s"],
  ["28%", "52%", "2.0s", "2.4s"],
  ["44%", "45%", "1.3s", "3.5s"],
  ["73%", "33%", "2.6s", "2.0s"],
  ["9%", "64%", "0.4s", "5.3s"],
  ["59%", "58%", "1.7s", "2.0s"],
  ["96%", "30%", "1.4s", "2.0s"],
  ["15%", "2%", "2.2s", "2.0s"],
  ["1%", "41%", "0.6s", "2.0s"],
  ["23%", "31%", "1.9s", "2.0s"],
  ["40%", "16%", "2.4s", "2.0s"],
  ["64%", "44%", "0.1s", "2.0s"],
  ["77%", "8%", "0.3s", "2.0s"],
  ["92%", "44%", "1.0s", "2.0s"],
  ["6%", "20%", "2.7s", "2.0s"],
  ["35%", "62%", "1.2s", "2.0s"],
  ["50%", "76%", "0.9s", "2.0s"],
  ["19%", "88%", "0.2s", "2.0s"],
  ["81%", "62%", "2.1s", "2.0s"],
  ["3%", "52%", "1.5s", "2.0s"],
  ["30%", "4%", "0.4s", "2.0s"],
  ["68%", "89%", "1.8s", "2.0s"],
  ["13%", "76%", "2.5s", "2.0s"],
  ["45%", "92%", "0.7s", "2.0s"],
  ["90%", "78%", "0.0s", "2.0s"],
];

function cosmosFieldPopstarsHtml(): string {
  return COSMOS_POPSTARS.map(
    ([left, top, del, dur]) =>
      `      <div class="cosmos-field__popstar" style="--sl:${left};--st:${top};--sd:${del};--ss:${dur}"><div class="cosmos-field__popstar-inner" aria-hidden="true"></div></div>`
  ).join("\n");
}

/** Rounded + sparkles: short rise + fade (subscription page only, CSS) */
const COSMOS_SPARKLE_N = 34;
const COSMOS_SHOOTING_N = 2;

function rand01(): number {
  // True randomness per page load. Falls back to Math.random if crypto isn't available.
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const u = new Uint32Array(1);
    crypto.getRandomValues(u);
    // 2^32 → [0, 1)
    return u[0] / 4294967296;
  }
  return Math.random();
}

function cosmosFieldPlusSparklesHtml(): string {
  const sparks = Array.from({ length: COSMOS_SPARKLE_N }, () => {
    const r1 = rand01();
    const r2 = rand01();
    const r3 = rand01();
    const r4 = rand01();

    // Slightly bias toward upper half so content area isn’t constantly twinkling.
    const left = 2 + r1 * 96;
    const top = 3 + Math.pow(r2, 1.55) * 88;

    // Make it “occasionally” sparkle: long duration with short active window in keyframes.
    const durS = 8.5 + r3 * 10.5; // 8.5–19s
    // Negative delay so field looks “already running” (no synchronized start on load).
    const delayS = -(r4 * durS);

    const armPx = 3.2 + rand01() * 3.9; // 3.2–7.1
    const thickPx = 0.85 + rand01() * 0.55; // 0.85–1.4
    const alpha = 0.28 + rand01() * 0.52; // overall brightness variance

    return `      <div class="cosmos-field__spark" style="--sx:${left.toFixed(
      2
    )}%;--sy:${top.toFixed(2)}%;--s-arm:${armPx.toFixed(2)}px;--s-thick:${thickPx.toFixed(
      2
    )}px;--s-alpha:${alpha.toFixed(3)};--s-delay:${delayS.toFixed(2)}s;--s-dur:${durS.toFixed(
      2
    )}s" aria-hidden="true"></div>`;
  }).join("\n");

  const shooting = Array.from({ length: COSMOS_SHOOTING_N }, () => {
    const r1 = rand01();
    const r2 = rand01();
    const r3 = rand01();
    const r4 = rand01();
    const r5 = rand01();

    // Start somewhere near the top; travel diagonally down-right.
    const startX = 5 + r1 * 70;
    const startY = 6 + Math.pow(r2, 1.4) * 34;
    const durS = 10 + r3 * 14; // 10–24s
    const delayS = -(r4 * durS); // already in motion (random phase)
    const dx = 360 + r5 * 520; // 360–880px
    const dy = 180 + rand01() * 360; // 180–540px
    const angle = 12 + rand01() * 20; // 12–32deg
    const widthPx = 130 + rand01() * 150; // 130–280px
    const thickPx = 1.4 + rand01() * 1.4; // 1.4–2.8px

    return `      <div class="cosmos-field__shoot" style="--tx:${startX.toFixed(
      2
    )}%;--ty:${startY.toFixed(2)}%;--t-delay:${delayS.toFixed(2)}s;--t-dur:${durS.toFixed(
      2
    )}s;--t-dx:${dx.toFixed(0)}px;--t-dy:${dy.toFixed(0)}px;--t-ang:${angle.toFixed(
      1
    )}deg;--t-w:${widthPx.toFixed(0)}px;--t-thick:${thickPx.toFixed(2)}px" aria-hidden="true"></div>`;
  }).join("\n");

  return `${sparks}\n${shooting}`;
}

let manualPageFlip: PageFlip | null = null;

/** Scroll position before PDF modal body lock; restored on animated close. */
let pdfModalScrollY = 0;
let pdfModalBodyLocked = false;
let pdfModalCloseTimer: number | undefined;
let shippingEtaRefreshTimer: number | undefined;
let productGalleryAsideHeightCleanup: (() => void) | undefined;
let missionStarDocumentClickUnbind: (() => void) | undefined;

/** Canonical Stripe Payment Link — Buy always opens this URL (no serverless checkout). */
const DEFAULT_STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/7sY14o2uDdBI0UE6Dtfbq02";

/** Default home (`/`) is subscription; override with VITE_STRIPE_SUBSCRIPTION_LINK if needed. */
const DEFAULT_STRIPE_SUBSCRIPTION_LINK =
  "https://buy.stripe.com/7sY6oI7OX0OW9rabXNfbq03";

function stripePaymentLinkUrl(): string {
  return import.meta.env.VITE_STRIPE_PAYMENT_LINK?.trim() || DEFAULT_STRIPE_PAYMENT_LINK;
}

function stripeSubscriptionLinkUrl(): string {
  return import.meta.env.VITE_STRIPE_SUBSCRIPTION_LINK?.trim() || DEFAULT_STRIPE_SUBSCRIPTION_LINK;
}

/** Shown next to Buy; keep in sync with your Stripe Price amount. */
const PRODUCT_PRICE_EUR = 59.99;
const productPriceDisplay = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
}).format(PRODUCT_PRICE_EUR);

/** Shown on `/` and `/subscription`; must match the Stripe subscription price in the dashboard. */
const SUBSCRIPTION_PRICE_EUR = 12.99;
const subscriptionPriceDisplay = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})
  .format(SUBSCRIPTION_PRICE_EUR)
  // de-DE uses NBSP before €; keep "12,99 €" for display
  .replace(/[\s\u00a0\u202f]+€/g, " €");

type LandingMode = "purchase" | "subscription";

type View = "product" | "subscription" | "thanks" | "manual" | "impressum" | "datenschutz";

/** Same WhatsApp number as dermatologist link; no prefilled text (legal / general contact). */
const WHATSAPP_CONTACT_URL = "https://wa.me/4917644429908";

/** Dermatologist Analysis WhatsApp (number + prefilled message). */
const WHATSAPP_CHAT_URL =
  "https://wa.me/4917644429908?text=Hi%2C%20this%20is%20the%20Dermatologist%20Analysis%20WhatsApp%20channel.%0AHere%20you%20can%20get%20an%20instant%20check%20to%20find%20out%20if%20you%20have%20oily%20or%20dry%20dandruff%2C%20so%20you%20get%20the%20right%20product%20for%20your%20scalp.%20Please%20send%203%20clear%20pictures%20of%20your%20head%20and%20scalp%20where%20the%20dandruff%20is%20visible%20in%20this%20chat.%0AYou%E2%80%99ll%20receive%20an%20immediate%20analysis%20from%20a%20dermatology-trained%20Teamember%20telling%20you%20exactly%20what%20type%20of%20dandruff%20you%20have.%0AFeel%20free%20to%20ask%20any%20other%20questions%20here%20too%20-%20just%20like%20you%20would%20to%20a%20friend.%0ABest%2C%20Your%20Blackbird%20Team";

function whatsappContactLinkHtml(): string {
  return `<a href="${escapeHtml(WHATSAPP_CONTACT_URL)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Served from public/; opened in modal via embed (better PDF support than iframe, esp. Safari). */
const PDF_MANUAL_FILE = "how-to-use-blackbird.pdf";

function pdfManualAbsoluteUrl(): string {
  const path = publicAssetUrl(PDF_MANUAL_FILE);
  return new URL(path, window.location.origin).href;
}

function pdfManualModalHtml(): string {
  return `
    <div class="pdf-modal" id="pdf-manual-modal" hidden>
      <button type="button" class="pdf-modal__backdrop" id="pdf-manual-backdrop" aria-label="Close manual"></button>
      <div class="pdf-modal__sheet" role="dialog" aria-modal="true" aria-label="BlackBird user manual">
        <button type="button" class="pdf-modal__close" id="pdf-manual-close" aria-label="Close">
          <svg class="pdf-modal__close-icon" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 5l10 10M15 5l-10 10"/>
          </svg>
        </button>
        <embed
          class="pdf-modal__embed"
          id="pdf-manual-embed"
          type="application/pdf"
          title="BlackBird user manual"
        />
        <p class="pdf-modal__pdf-actions">
          <a class="pdf-modal__newtab" id="pdf-manual-newtab" href="#" target="_blank" rel="noopener noreferrer"
            >Open manual in new tab</a>
        </p>
      </div>
    </div>`;
}

function lockBodyScrollForPdfModal(): void {
  pdfModalScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${pdfModalScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  pdfModalBodyLocked = true;
}

function unlockBodyScrollAfterPdfModal(): void {
  if (!pdfModalBodyLocked) {
    document.body.style.overflow = "";
    return;
  }
  pdfModalBodyLocked = false;
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  window.scrollTo({ top: pdfModalScrollY, left: 0, behavior: "auto" });
}

function openPdfManualModal(): void {
  window.clearTimeout(pdfModalCloseTimer);
  const modal = document.getElementById("pdf-manual-modal");
  const embed = document.querySelector<HTMLEmbedElement>("#pdf-manual-embed");
  const newTab = document.querySelector<HTMLAnchorElement>("#pdf-manual-newtab");
  if (!modal || !embed) return;
  lockBodyScrollForPdfModal();
  const url = pdfManualAbsoluteUrl();
  embed.src = url;
  if (newTab) newTab.href = url;
  modal.hidden = false;
  modal.classList.add("pdf-modal--open");
}

function closePdfManualModal(immediate = false): void {
  window.clearTimeout(pdfModalCloseTimer);
  const modal = document.getElementById("pdf-manual-modal");

  const applyClose = (): void => {
    if (modal) {
      modal.hidden = true;
      modal.classList.remove("pdf-modal--open");
    }
    const emb = document.querySelector<HTMLEmbedElement>("#pdf-manual-embed");
    if (emb) {
      emb.removeAttribute("src");
    }
    unlockBodyScrollAfterPdfModal();
  };

  if (!modal) {
    unlockBodyScrollAfterPdfModal();
    return;
  }

  if (immediate) {
    applyClose();
    return;
  }

  if (!modal.classList.contains("pdf-modal--open")) {
    applyClose();
    return;
  }

  modal.classList.remove("pdf-modal--open");
  pdfModalCloseTimer = window.setTimeout(() => {
    applyClose();
  }, 320);
}

/** Shown arrival = always now + 6h, formatted in the visitor’s local timezone and locale. */
const SHIPPING_ETA_LEAD_HOURS = 6;

/** "Today" / localized, keyed by BCP-47 base language. */
const DELIVERY_TODAY_I18N: Readonly<Record<string, string>> = {
  en: "Today",
  de: "Heute",
  fr: "Aujourd’hui",
  es: "Hoy",
  pt: "Hoje",
  it: "Oggi",
  nl: "Vandaag",
  pl: "Dzisiaj",
  sv: "I dag",
  no: "I dag",
  nb: "I dag",
  da: "I dag",
  fi: "Tänään",
  ja: "今日",
  ko: "오늘",
  zh: "今天",
  ar: "اليوم",
  hi: "आज",
  ru: "Сегодня",
  uk: "Сьогодні",
  tr: "Bugün",
  cs: "Dnes",
};

function viewerLocaleAndTimeZone(): { locale: string; timeZone: string } {
  const locale =
    (typeof navigator !== "undefined" && (navigator.languages?.[0] || navigator.language)) || "en";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return { locale, timeZone: tz && tz.length > 0 ? tz : "UTC" };
}

function sameCalendarDayInTimeZone(a: Date, b: Date, timeZone: string): boolean {
  const key = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  return key(a) === key(b);
}

function todayLabelForLocale(locale: string): string {
  const b = (locale.toLowerCase().split("-")[0] ?? "en");
  if (b && DELIVERY_TODAY_I18N[b]) return DELIVERY_TODAY_I18N[b];
  return DELIVERY_TODAY_I18N.en;
}

/** Hour in viewer’s locale; 12h Latin am/pm lowercased to match site style (e.g. 10 pm). */
function formatArrivalHourInViewerLocale(d: Date, locale: string, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric" });
  let s = dtf.format(d);
  if (dtf.resolvedOptions().hour12) {
    s = s.replace(/(\s+)(A\.?M\.?|P\.?M\.?)$/i, (_m, _sp, ap) => {
      return ` ${/^A/i.test(ap.replace(/[^A-Za-z]/g, "")) ? "am" : "pm"}`;
    });
  }
  return s.trim();
}

function formatArrivalDatePartInViewerLocale(
  d: Date,
  locale: string,
  timeZone: string
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    month: "long",
    day: "numeric",
  }).format(d);
}

/** e.g. “Free Delivery Heute 22 Uhr, 22. April” in DE, “Free Delivery 今天 …” in zh, etc. */
function formatShippingArrivalLineHtml(nowMs: number = Date.now()): string {
  const { locale, timeZone } = viewerLocaleAndTimeZone();
  const now = new Date(nowMs);
  const arrival = new Date(nowMs + SHIPPING_ETA_LEAD_HOURS * 60 * 60 * 1000);
  const calPart = formatArrivalDatePartInViewerLocale(arrival, locale, timeZone);
  const timeStr = formatArrivalHourInViewerLocale(arrival, locale, timeZone);
  const dayWord = sameCalendarDayInTimeZone(arrival, now, timeZone)
    ? todayLabelForLocale(locale)
    : new Intl.DateTimeFormat(locale, { timeZone, weekday: "long" }).format(arrival);
  const tail = `${dayWord} ${timeStr}, ${calPart}`;
  return `<span class="product-shipping__free">Free</span> Delivery <span class="product-shipping__eta-datetime">${escapeHtml(tail)}</span>`;
}

function updateProductShippingEta(): void {
  const el = document.querySelector("#product-shipping-eta");
  if (!el) return;
  el.innerHTML = formatShippingArrivalLineHtml();
}

function whatsAppBlockHtml(): string {
  return `
            <div class="product-wa-block" id="hair-analysis">
              <div class="product-wa-row">
                <div class="product-wa-text">
                  <p class="product-wa-headline">Get a free Dermatologist Check</p>
                  <p class="product-wa-desc">
                    Our set is for dry flakes, if you are not sure if you have dry or oily flakes
                    <a class="product-wa-link" href="${escapeHtml(WHATSAPP_CHAT_URL)}" target="_blank" rel="noopener noreferrer">WhatsApp</a> us.
                  </p>
                </div>
                <div class="product-wa-qr-column" aria-hidden="true">
                  <img
                    src="${publicAssetUrl("whatsapp-qr.png")}"
                    width="300"
                    height="300"
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
  if (path === "/" || path === "/subscription") return "subscription";
  if (path === "/thanks") return "thanks";
  if (path === "/how-to-use") return "manual";
  if (path === "/agb") {
    history.replaceState(null, "", `${BASE_HREF}impressum#shop-agb`);
    return "impressum";
  }
  if (path === "/widerruf") {
    history.replaceState(null, "", `${BASE_HREF}impressum#shop-widerruf`);
    return "impressum";
  }
  if (path === "/impressum") return "impressum";
  if (path === "/datenschutz") return "datenschutz";
  return "subscription";
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

function scrollToHashSection(): void {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const el = document.getElementById(hash);
  if (!el) return;
  el.scrollIntoView({ behavior: "auto", block: "start" });
  if (el instanceof HTMLElement && (hash === "education" || hash === "site-footer")) {
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
    });
  }
}

type ProductFaqPanelPlace = "above" | "below" | "left" | "right";

type ProductFaqItem = {
  id: string;
  question: string;
  pinLabel: string;
  answer: string;
  pinTop: string;
  pinLeft: string;
  panel: ProductFaqPanelPlace;
};

const PRODUCT_FAQ_ITEMS: readonly ProductFaqItem[] = [
  {
    id: "what-is",
    question: "What is this?",
    pinLabel: "What is this?",
    answer:
      "After my flight I opened my bag and found shampoo all over it. Never again.\n\nWe installed pump locks. Twist it to shut the spray when you are traveling.",
    pinTop: "47%",
    pinLeft: "23%",
    panel: "below",
  },
  {
    id: "two-bottles",
    question: "Why two daily washes?",
    pinLabel: "Why two daily washes?",
    answer:
      "Airport security once threw my shampoo away. Never again.\n\nBoth are 100ml, you can take them wherever you want.",
    pinTop: "28%",
    pinLeft: "38%",
    panel: "above",
  },
  {
    id: "why-spray",
    question: "Why spray?",
    pinLabel: "Why spray?",
    answer:
      "Spray gets the formula straight to your scalp. Same motion as hairspray and done in seconds.",
    pinTop: "30%",
    pinLeft: "77%",
    panel: "above",
  },
];

const PRODUCT_FAQ_SUBSCRIPTION_ITEM: ProductFaqItem = {
  id: "subscription",
  question: "Subscription",
  pinLabel: "Subscription",
  answer:
    "Your scalp should have consistency. When your bottles run empty, we send the next full set. You can cancel your subscription anytime.",
  pinTop: "63%",
  pinLeft: "80%",
  panel: "above",
};

function productFaqItemsForMode(mode: LandingMode): readonly ProductFaqItem[] {
  if (mode === "subscription") {
    return [...PRODUCT_FAQ_ITEMS, PRODUCT_FAQ_SUBSCRIPTION_ITEM];
  }
  return PRODUCT_FAQ_ITEMS;
}

function closeAllProductFaqPanels(faq: HTMLElement): void {
  faq.querySelectorAll<HTMLButtonElement>(".product-faq__pin").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    const id = btn.getAttribute("aria-controls");
    if (id) {
      const p = document.getElementById(id);
      if (p) {
        p.hidden = true;
        p.style.removeProperty("transform");
      }
    }
  });
}

/** After showing a panel, shift its transform so it stays within the viewport. */
function clampFaqPanelToViewport(panel: HTMLElement): void {
  requestAnimationFrame(() => {
    const rect = panel.getBoundingClientRect();
    const margin = 8;
    const overRight = rect.right - (window.innerWidth - margin);
    const overLeft = margin - rect.left;
    if (overRight > 0) {
      panel.style.transform = `translateX(calc(-50% - ${overRight}px))`;
    } else if (overLeft > 0) {
      panel.style.transform = `translateX(calc(-50% + ${overLeft}px))`;
    }
  });
}

function productFaqAnswerHtml(answer: string): string {
  return answer
    .trim()
    .split(/\n\n+/)
    .map((block) => {
      const inner = block
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br />");
      return `<p class="product-faq__answer">${inner}</p>`;
    })
    .join("");
}

function productGalleryHtml(): string {
  const n = PRODUCT_CAROUSEL_SLIDES.length;
  const thumbs = PRODUCT_CAROUSEL_SLIDES.map((slide, i) => {
    const src = publicAssetUrl(slide.file);
    return `
            <button
              type="button"
              class="product-gallery__thumb${i === 0 ? " is-active" : ""}"
              data-gallery-index="${i}"
              aria-label="${escapeHtml(`Product photo ${i + 1} of ${n}`)}"
              aria-current="${i === 0 ? "true" : "false"}"
            >
              <img
                src="${escapeHtml(src)}"
                alt=""
                width="80"
                height="64"
                decoding="async"
                loading="${i === 0 ? "eager" : "lazy"}"
              />
            </button>`;
  }).join("");

  const first = PRODUCT_CAROUSEL_SLIDES[0];
  const firstSrc = publicAssetUrl(first.file);

  return `
        <div class="product-gallery" id="product-gallery">
          <div class="product-gallery__main">
            <div
              class="product-gallery__stage"
              id="product-gallery-stage"
              tabindex="0"
              aria-label="Product photos. Drag horizontally to change image, or use thumbnails."
            >
              <figure class="product-gallery__figure">
                <img
                  id="product-gallery-main-img"
                  class="product-gallery__main-img"
                  src="${escapeHtml(firstSrc)}"
                  width="1024"
                  height="819"
                  alt="${escapeHtml(first.alt)}"
                  decoding="async"
                  fetchpriority="high"
                  draggable="false"
                />
                <div class="product-gallery__thumbs" role="list" aria-label="Product photo thumbnails">${thumbs}</div>
              </figure>
            </div>
          </div>
        </div>`;
}

function productFaqSectionHtml(mode: LandingMode): string {
  const items = productFaqItemsForMode(mode);
  const spots = items.map((item) => {
    const panelId = `product-faq-panel-${item.id}`;
    const btnId = `product-faq-btn-${item.id}`;
    return `
          <div
            class="product-faq__spot"
            data-id="${item.id}"
            style="--pin-top:${item.pinTop};--pin-left:${item.pinLeft};"
          >
            <div
              class="product-faq__panel product-faq__panel--${item.panel}"
              id="${panelId}"
              role="region"
              hidden
              aria-labelledby="${btnId}"
            >
              <div class="product-faq__answer-wrap">${productFaqAnswerHtml(item.answer)}</div>
            </div>
            <button
              type="button"
              class="product-faq__pin"
              id="${btnId}"
              aria-expanded="false"
              aria-controls="${panelId}"
              aria-label="${escapeHtml(item.question)}"
            >
              <span class="product-faq__pin-label" aria-hidden="true">${escapeHtml(item.pinLabel)}</span>
            </button>
          </div>`;
  }).join("");

  return `
    <section class="product-faq" id="product-faq" aria-labelledby="product-faq-heading">
      <h2 id="product-faq-heading" class="product-faq__heading product-faq__heading--script">FAQ</h2>
      <div class="product-faq__figure">
        <img
          class="product-faq__img"
          src="${publicAssetUrl("faq-four-bottles.png")}"
          width="1024"
          height="576"
          alt="BLACKBIRD set: two Daily Wash bottles, After Wash spray, and Before Sleep spray"
          decoding="async"
          loading="lazy"
        />
        <div class="product-faq__spots">${spots}</div>
      </div>
    </section>`;
}

function productEducationSectionHtml(): string {
  return `
    <section
      class="product-education"
      id="education"
      tabindex="-1"
      aria-labelledby="education-heading"
    >
      <h2 id="education-heading" class="product-education__title product-education__title--script">Education</h2>
      <p class="product-education__lead">
        There are two types of dandruff: oily and dry. You need to know which one you have to select the right products.
      </p>
      <div class="product-education__grid">
        <div class="product-education__card">
          <h3 class="product-education__sub">Oily flakes</h3>
          <p class="product-education__text">
            These are yellowish, greasy, and sticky. They stay on your scalp and hair. Your scalp makes too much oil and yeast grows too much.
          </p>
        </div>
        <div class="product-education__card">
          <h3 class="product-education__sub">Dry flakes</h3>
          <p class="product-education__text">
            These are small white flakes that fall easily. Your scalp feels tight and itchy. Your scalp does not make enough oil and becomes too dry.
          </p>
        </div>
      </div>
      <p class="product-education__stats">
        Roughly 50% of adults experience dandruff at some point in their lives. In other words, one out of every two people you meet has likely dealt with it. Dandruff tends to appear after puberty and can persist throughout adulthood, often peaking between the ages of 20 and 40. The condition is slightly more common in men.
      </p>
    </section>`;
}

function homeHtml(mode: LandingMode = "subscription"): string {
  const isSubscription = mode === "subscription";
  const checkoutHref = isSubscription ? stripeSubscriptionLinkUrl() : stripePaymentLinkUrl();
  const priceBlock = isSubscription
    ? ""
    : `<p class="product-price">${escapeHtml(productPriceDisplay)}</p>`;
  const subscriptionCancelLede = isSubscription
    ? `<p class="product-subscription-lede">You can cancel your subscription anytime.</p>`
    : "";
  const returnsLine = isSubscription
    ? ""
    : `<p class="product-shipping__returns"><span class="product-shipping__free">Free</span> 30 Days Return</p>`;
  const subscriptionShippingTopLine = isSubscription
    ? `<p class="product-shipping__eta product-shipping__eta--note"><span class="product-shipping__free">Free</span> new monthly set</p>`
    : "";
  const buyLabel = isSubscription ? "Subscribe" : "Buy";
  const shellClass = isSubscription ? "home-shell home-shell--subscription" : "home-shell";
  const subscriptionPriceOnCard = isSubscription
    ? `<p class="product-price product-price--subscription-on-card"><span class="product-price__amount">${escapeHtml(subscriptionPriceDisplay)}</span><span class="product-price__period">/ month</span></p>`
    : "";

  const productBuyPanel = isSubscription
    ? `          <div class="product-panel product-panel--buy product-panel--buy-subscription">
            <div class="product-offer-card">
              <div class="product-identity product-identity--subscription">
                <h2 class="product-name product-name--subscription">Blackbird Men Dandruff Set</h2>
                ${subscriptionPriceOnCard}
              </div>
              ${subscriptionCancelLede}
              <div class="product-shipping product-shipping--subscription">
                ${subscriptionShippingTopLine}
                <p class="product-shipping__eta product-shipping__eta--arrival" id="product-shipping-eta" aria-live="polite"></p>
              </div>
              <a
                class="btn-buy"
                id="buy-btn"
                href="${escapeHtml(checkoutHref)}"
                rel="noopener noreferrer"
              >${buyLabel}</a>
              ${whatsAppBlockHtml()}
            </div>
          </div>`
    : `          <div class="product-panel product-panel--buy">
            <div class="product-identity">
            <h2 class="product-name">Blackbird Men Dandruff Set</h2>
            ${priceBlock}
            </div>
            <div class="product-shipping">
              ${returnsLine}
              ${subscriptionShippingTopLine}
              <p class="product-shipping__eta" id="product-shipping-eta" aria-live="polite"></p>
            </div>
            <a
              class="btn-buy"
              id="buy-btn"
              href="${escapeHtml(checkoutHref)}"
              rel="noopener noreferrer"
            >${buyLabel}</a>
            ${whatsAppBlockHtml()}
          </div>`;

  return `
    <div class="${shellClass}">
    <div class="cosmos-field" aria-hidden="true">
      ${cosmosFieldDustMotesHtml()}
      ${cosmosFieldPopstarsHtml()}
      ${cosmosFieldPlusSparklesHtml()}
    </div>
    <div class="skip-links" role="navigation" aria-label="Skip links">
      <a href="#education" class="skip-link">Skip to Education</a>
      <a href="#site-footer" class="skip-link">Skip to legal information</a>
    </div>
    <section class="hero-editorial">
      <div class="hero-editorial__title-wrap">
        <h1 class="hero-editorial__title">blackbird</h1>
      </div>
      <div class="hero-editorial__bottom">
        <p class="hero-editorial__script">get flake free</p>
        <button type="button" class="btn-pill" id="cta-now">Now</button>
      </div>
    </section>

    <div class="page-product" id="product">
      <main class="product-layout${isSubscription ? " product-layout--subscription" : ""}">
        <div class="product-shots-wrap">
          ${productGalleryHtml()}
        </div>

        <aside class="product-side" aria-label="Product details">
${productBuyPanel}
          <div class="product-panel product-panel--howto">
            <button type="button" class="btn-howto" id="product-howto-open">How to use BlackBird</button>
          </div>
        </aside>
      </main>
    </div>
    ${productFaqSectionHtml(mode)}
    ${productEducationSectionHtml()}
    ${siteLegalFooterHtml()}
    ${pdfManualModalHtml()}
    <div class="mission-star-dock" id="mission-star-dock">
      <div
        class="mission-star-bubble"
        id="mission-star-bubble"
        role="status"
        aria-live="polite"
        hidden
      >
        <p class="mission-star-bubble__text">
          Every purchase helps two German guys to build tech to help humanity explore the universe.
        </p>
      </div>
      <button
        type="button"
        class="mission-star"
        id="mission-star"
        aria-label="Show a message from the team"
        aria-expanded="false"
        aria-controls="mission-star-bubble"
      >
        <span class="mission-star__glyph" aria-hidden="true">✦</span>
      </button>
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

function legalPageShell(title: string, body: string): string {
  return `
    <div class="page-step page-legal">
      <header class="legal-header">
        <a href="${BASE_HREF}" class="manual-back">Zur Startseite</a>
      </header>
      <main class="legal-main">
        <h1 class="legal-title">${escapeHtml(title)}</h1>
        <div class="legal-prose">${body}</div>
      </main>
    </div>`;
}

function legalSupportFooterChunkHtml(): string {
  const iconSrc = escapeHtml(publicAssetUrl("whatsapp-icon.png"));
  return `<span class="site-legal-footer__chunk site-legal-footer__chunk--support">Any open questions? Message our support on ${whatsappContactLinkHtml()} <img src="${iconSrc}" alt="" width="20" height="20" class="site-legal-footer__wa-icon" decoding="async" loading="lazy" /></span>`;
}

function siteLegalFooterHtml(): string {
  const i = `${BASE_HREF}impressum`;
  const d = `${BASE_HREF}datenschutz`;
  return `
    <footer class="site-legal-footer" id="site-footer" tabindex="-1" aria-label="Rechtliches">
      <p class="cosmos-void-trace" aria-hidden="true" title="Hello, empty space">·&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·&nbsp;·</p>
      <div class="site-legal-footer__line site-legal-footer__line--meta">
        ${legalSupportFooterChunkHtml()}
      </div>
      <nav class="site-legal-footer__line site-legal-footer__nav" aria-label="Rechtliche Hinweise">
        <a href="${i}">Impressum</a>
        <a href="${d}">Datenschutz</a>
      </nav>
    </footer>`;
}

function impressumHtml(): string {
  const body = `
    <p class="legal-lead">Angaben gemäß § 5 TMG / § 55 Abs. 1 RStV</p>
    <h2 class="legal-h2">Diensteanbieter</h2>
    <p>
      HUGE Production GmbH<br />
      Sebnitzer Str. 35<br />
      01099 Dresden<br />
      Deutschland
    </p>
    <h2 class="legal-h2">Support</h2>
    <p>
      ${whatsappContactLinkHtml()}
    </p>
    <h2 class="legal-h2">Vertretungsberechtigte Geschäftsführer</h2>
    <p>Tadeus Jonathan Mehl, Konstantin Saifoulline</p>
    <h2 class="legal-h2">Registereintrag</h2>
    <p>
      Eintragung im Handelsregister. Registergericht: Amtsgericht Dresden.<br />
      Die Handelsregisternummer (HRB) ergänzen wir nach Eintragung oder auf Anfrage.
    </p>
    <h2 class="legal-h2">Umsatzsteuer</h2>
    <p>
      Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: wird bei Vorliegen ggf. angegeben.
    </p>
    <h2 class="legal-h2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
    <p>
      Tadeus Jonathan Mehl, Konstantin Saifoulline<br />
      HUGE Production GmbH, Anschrift wie oben.
    </p>
    <h2 class="legal-h2">EU-Streitschlichtung</h2>
    <p>
      Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
      <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a>.
      Unsere Kontaktdaten finden Sie oben im Impressum. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
    </p>

    <section id="shop-agb" tabindex="-1">
      <h2 class="legal-h2">Allgemeine Geschäftsbedingungen (AGB)</h2>
      <p class="legal-lead">Für den Online-Kauf über diese Website</p>
      <h3 class="legal-h3">§ 1 Geltungsbereich</h3>
      <p>
        Diese AGB gelten für Verträge zwischen HUGE Production GmbH (nachfolgend „Anbieter“) und Verbraucherinnen und Verbrauchern (nachfolgend „Kunde“) über die über diese Website angebotenen Waren.
      </p>
      <h3 class="legal-h3">§ 2 Vertragsschluss</h3>
      <p>
        Die Darstellung der Produkte auf der Website stellt kein rechtlich bindendes Angebot dar. Die Bestellung des Kunden stellt ein Angebot zum Abschluss eines Kaufvertrags dar. Der Vertrag kommt zustande, sobald der Anbieter die Bestellung annimmt oder die Ware ausliefert oder der Kunde zur Zahlung per Zahlungsdienstleister weitergeleitet wird und die Zahlung ordnungsgemäß erfolgt – je nach technischem Ablauf des Bestellvorgangs.
      </p>
      <h3 class="legal-h3">§ 3 Preise und Versandkosten</h3>
      <p>
        Es gelten die zum Zeitpunkt der Bestellung auf der Website angegebenen Preise und Versandbedingungen. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern ausgewiesen.
      </p>
      <h3 class="legal-h3">§ 4 Zahlung</h3>
      <p>
        Die Zahlung erfolgt über den angegebenen Zahlungsdienstleister (z.&nbsp;B. Stripe). Es gelten dabei die jeweiligen Bedingungen des Zahlungsdienstleisters.
      </p>
      <h3 class="legal-h3">§ 5 Lieferung</h3>
      <p>
        Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse innerhalb der angegebenen Fristen, sofern nichts Abweichendes vereinbart ist.
      </p>
      <h3 class="legal-h3">§ 6 Gewährleistung</h3>
      <p>
        Es gelten die gesetzlichen Gewährleistungsrechte. Für Verbraucher beträgt die gesetzliche Verjährungsfrist für Mängelansprüche bei neuen Waren zwei Jahre ab Lieferung der Ware.
      </p>
      <h3 class="legal-h3">§ 7 Haftung</h3>
      <p>
        Die Haftung des Anbieters richtet sich nach den gesetzlichen Vorschriften, soweit ausgeschlossen nicht zulässig ist. Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den typischen, vorhersehbaren Schaden.
      </p>
      <h3 class="legal-h3">§ 8 Schlussbestimmungen</h3>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Staates, in dem der Kunde seinen gewöhnlichen Aufenthalt hat, bleiben unberührt, sofern anwendbar.
        Gerichtsstand und Erfüllungsort bei Verträgen mit Kaufleuten sind, soweit zulässig, der Sitz des Anbieters.
      </p>
      <p>
        <strong>Hinweis:</strong> Passen Sie diese AGB bei Bedarf an Ihren konkreten Vertrags- und Checkout-Prozess an (z.&nbsp;B. Bestellbestätigung, Lieferländer, Streitbeilegung).
      </p>
    </section>

    <section id="shop-widerruf" tabindex="-1">
      <h2 class="legal-h2">Widerrufsbelehrung</h2>
      <p class="legal-lead">Für Verbraucherinnen und Verbraucher</p>
      <h3 class="legal-h3">Widerrufsrecht</h3>
      <p>
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
      </p>
      <p>
        Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (HUGE Production GmbH, Sebnitzer Str. 35, 01099 Dresden)
        mittels einer eindeutigen Erklärung (z.&nbsp;B. ein mit der Post versandter Brief oder eine Nachricht über die oben genannten Kontaktwege, einschließlich ${whatsappContactLinkHtml()}) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
      </p>
      <h3 class="legal-h3">Folgen des Widerrufs</h3>
      <p>
        Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
      </p>
      <p>
        Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, welches der frühere Zeitpunkt ist.
      </p>
      <p>
        Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben. Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.
      </p>
      <p>
        Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.
      </p>
      <p>
        <strong>Hinweis zum Erlöschen des Widerrufsrechts:</strong> Das Widerrufsrecht erlischt bei Verträgen über die Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde (sofern zutreffend).
      </p>
      <h3 class="legal-h3">Muster-Widerrufsformular</h3>
      <p>
        Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.
      </p>
      <pre class="legal-pre" aria-label="Muster-Widerrufsformular">An HUGE Production GmbH
Sebnitzer Str. 35
01099 Dresden

Support: siehe oben unter „Support“ (u. a. WhatsApp)

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)

Bestellt am (*)/erhalten am (*)

Name des/der Verbraucher(s)

Anschrift des/der Verbraucher(s)

Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)

Datum

(*) Unzutreffendes streichen.</pre>
    </section>
  `;
  return legalPageShell("Impressum", body);
}

function datenschutzHtml(): string {
  const body = `
    <p class="legal-lead">
      Diese Datenschutzerklärung informiert Sie über die Verarbeitung personenbezogener Daten bei Nutzung dieser Website und der über sie angebotenen Angebote (z.&nbsp;B. Bestellung).
    </p>
    <h2 class="legal-h2">Verantwortlicher</h2>
    <p>
      HUGE Production GmbH<br />
      Sebnitzer Str. 35, 01099 Dresden, Deutschland<br />
      Support: ${whatsappContactLinkHtml()}
    </p>
    <h2 class="legal-h2">Allgemeines</h2>
    <p>
      Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen. Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website, unserer Inhalte und Leistungen (z.&nbsp;B. Bestellabwicklung) erforderlich ist oder Sie eingewilligt haben bzw. eine gesetzliche Grundlage besteht.
    </p>
    <h2 class="legal-h2">Hosting und Server-Logfiles</h2>
    <p>
      Beim Aufruf dieser Website werden durch den Hosting-Provider bzw. Server automatisch Informationen in sogenannten Server-Logfiles erhoben (z.&nbsp;B. IP-Adresse, Datum und Uhrzeit des Abrufs, Browsertyp, Betriebssystem). Die Verarbeitung dient der Sicherheit (z.&nbsp;B. Missbrauchsbekämpfung) und der Stabilität der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
    </p>
    <h2 class="legal-h2">Bestellung und Zahlung (Stripe)</h2>
    <p>
      Wenn Sie über unsere Website einen Kauf tätigen, leiten wir Sie zur Zahlungsabwicklung an den Zahlungsdienstleister Stripe weiter. Dabei werden die zur Vertragsabwicklung erforderlichen Daten (z.&nbsp;B. Bestell- und Zahlungsdaten) verarbeitet. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertrag). Näheres zu Stripe finden Sie in der Datenschutzerklärung von Stripe:
      <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer">stripe.com/de/privacy</a>.
    </p>
    <h2 class="legal-h2">Rückerstattung</h2>
    <p>
      Eine Rückerstattung Ihrer Zahlung können Sie erhalten, sofern die dafür maßgeblichen gesetzlichen oder vertraglichen Voraussetzungen erfüllt sind (hierzu siehe <a href="${BASE_HREF}impressum#shop-agb">AGB</a> und <a href="${BASE_HREF}impressum#shop-widerruf">Widerrufsbelehrung</a> im Impressum). Zur Bearbeitung und Klärung von Rückerstattungsanträgen kontaktieren Sie bitte unseren Support: ${whatsappContactLinkHtml()}.
    </p>
    <h2 class="legal-h2">WhatsApp</h2>
    <p>
      Wenn Sie über einen Link auf unserer Website WhatsApp (Meta) nutzen, gelten die dortigen Nutzungs- und Datenschutzbedingungen des jeweiligen Anbieters. Wir haben keinen Einfluss auf die Datenverarbeitung durch Meta/WhatsApp außerhalb unserer Website.
    </p>
    <h2 class="legal-h2">Support über WhatsApp</h2>
    <p>
      Wenn Sie uns über WhatsApp kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage. Es gelten die Nutzungs- und Datenschutzbedingungen von Meta/WhatsApp. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen bzw. Vertrag) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung).
    </p>
    <h2 class="legal-h2">Speicherdauer</h2>
    <p>
      Wir speichern personenbezogene Daten nur so lange, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
    </p>
    <h2 class="legal-h2">Ihre Rechte</h2>
    <p>
      Sie haben nach Maßgabe der DSGVO insbesondere das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung. Außerdem haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren.
    </p>
    <h2 class="legal-h2">Änderungen</h2>
    <p>
      Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich Rechtslage oder unsere Leistungen ändern. Maßgeblich ist die jeweils auf der Website veröffentlichte Fassung.
    </p>
  `;
  return legalPageShell("Datenschutzerklärung", body);
}

function manualPageUrls(): string[] {
  return Array.from({ length: MANUAL_PAGE_COUNT }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `${publicAssetUrl(`manual/page-${n}.svg`)}?v=${MANUAL_PAGE_VER}`;
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
        <div class="manual-intro" id="manual-intro" role="button" tabindex="0" aria-label="How to use BlackBird: click anywhere to start">
          <img class="manual-intro__preview" src="${publicAssetUrl("manual/page-01.svg")}?v=${MANUAL_PAGE_VER}" alt="" width="600" height="800" decoding="async" />
          <div class="manual-intro__dim" aria-hidden="true"></div>
          <div class="manual-intro__copy">
            <h2 class="manual-intro__title">How to use BlackBird</h2>
            <p class="manual-intro__hint">Click anywhere to start</p>
          </div>
        </div>
        <div class="manual-end" id="manual-end" hidden>
          <p class="manual-end__lede">Ready to try blackbird®?</p>
          <a class="manual-end__cta" href="${BASE_HREF}product">Get your set</a>
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

function setDocumentLang(view: View): void {
  const de = view === "impressum" || view === "datenschutz";
  document.documentElement.lang = de ? "de" : "en";
}

function render(): void {
  window.clearInterval(shippingEtaRefreshTimer);
  shippingEtaRefreshTimer = undefined;
  productGalleryAsideHeightCleanup?.();
  productGalleryAsideHeightCleanup = undefined;
  closePdfManualModal(true);
  destroyManualPageFlip();
  removeManualEndTap();
  missionStarDocumentClickUnbind?.();
  missionStarDocumentClickUnbind = undefined;
  const path = getAppPath();
  const wasEmailPath = path === "/email";
  if (wasEmailPath) {
    history.replaceState(null, "", BASE_HREF);
  } else if (path === "/admin" || path.startsWith("/admin/")) {
    history.replaceState(null, "", BASE_HREF);
  }

  if (getAppPath() === "/subscription") {
    history.replaceState(null, "", `${BASE_HREF}${location.search}${location.hash}`);
  }

  const view = pathToView();
  setDocumentLang(view);

  if (view === "product" || view === "subscription") {
    const landingMode: LandingMode = view === "subscription" ? "subscription" : "purchase";
    root.innerHTML = homeHtml(landingMode);
    bindLanding();
    bindProduct();
    const scrollProduct =
      view === "product" || (view === "subscription" && wasEmailPath);
    if (scrollProduct) {
      scrollToProduct(view === "product" ? "auto" : "smooth");
    } else if (
      location.hash === "#product-faq" ||
      location.hash === "#education" ||
      location.hash === "#site-footer"
    ) {
      requestAnimationFrame(() => scrollToHashSection());
    }
  } else if (view === "manual") {
    root.innerHTML = manualHtml();
    bindManual();
  } else if (view === "thanks") {
    root.innerHTML = thanksHtml();
  } else if (view === "impressum") {
    root.innerHTML = impressumHtml();
    if (location.hash === "#shop-agb" || location.hash === "#shop-widerruf") {
      requestAnimationFrame(() => scrollToHashSection());
    }
  } else if (view === "datenschutz") {
    root.innerHTML = datenschutzHtml();
  }

  document.body.classList.toggle("subscription-view", view === "subscription");
  document.body.classList.toggle("legal-page-view", view === "impressum" || view === "datenschutz");
  const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColorMeta) {
    const chrome =
      view === "impressum" || view === "datenschutz"
        ? "#f9f5ef"
        : view === "subscription"
          ? "#000000"
          : "#2e2a26";
    themeColorMeta.setAttribute("content", chrome);
  }

  if (view === "thanks") bindThanks();
}

function bindLanding(): void {
  document.querySelector("#cta-now")?.addEventListener("click", () => {
    scrollToProduct("smooth");
  });
}

function bindProduct(): void {
  document.querySelector("#product-howto-open")?.addEventListener("click", () => {
    openPdfManualModal();
  });

  document.querySelector("#pdf-manual-backdrop")?.addEventListener("click", () => {
    closePdfManualModal();
  });

  document.querySelector("#pdf-manual-close")?.addEventListener("click", () => {
    closePdfManualModal();
  });

  bindProductShotsCarousel();
  bindProductGalleryAsideHeight();
  bindProductFaq();
  bindMissionStar();
  updateProductShippingEta();
  shippingEtaRefreshTimer = window.setInterval(updateProductShippingEta, 60_000);
}

/** Desktop: gallery = same outer size as .product-side (buy + WhatsApp + how-to panels). */
function bindProductGalleryAsideHeight(): void {
  productGalleryAsideHeightCleanup?.();
  const gallery = document.querySelector<HTMLElement>("#product-gallery");
  const side = document.querySelector<HTMLElement>(".product-side");
  if (!gallery || !side) return;

  const apply = (): void => {
    if (window.matchMedia("(max-width: 839px)").matches) {
      gallery.style.removeProperty("height");
      gallery.style.removeProperty("width");
      return;
    }
    const hSide = Math.round(side.offsetHeight);
    if (document.body.classList.contains("subscription-view")) {
      const minPicture = Math.min(Math.round(window.innerHeight * 0.55), 760);
      gallery.style.height = `${Math.max(hSide, minPicture)}px`;
    } else {
      gallery.style.height = `${hSide}px`;
    }
    gallery.style.removeProperty("width");
  };

  apply();
  requestAnimationFrame(() => {
    requestAnimationFrame(apply);
  });
  window.addEventListener("load", apply, { once: true });
  document.fonts?.ready?.then(() => requestAnimationFrame(apply));
  const ro = new ResizeObserver(() => {
    requestAnimationFrame(apply);
  });
  ro.observe(side);
  const onResize = (): void => {
    apply();
  };
  window.addEventListener("resize", onResize);

  productGalleryAsideHeightCleanup = () => {
    ro.disconnect();
    window.removeEventListener("resize", onResize);
    gallery.style.removeProperty("height");
    gallery.style.removeProperty("width"); // clear any leftover from earlier versions
  };
}

function closeMissionStarBubble(): boolean {
  const bubble = document.getElementById("mission-star-bubble");
  const star = document.getElementById("mission-star");
  if (!bubble || bubble.hasAttribute("hidden")) return false;
  bubble.setAttribute("hidden", "");
  star?.setAttribute("aria-expanded", "false");
  return true;
}

function bindMissionStar(): void {
  missionStarDocumentClickUnbind?.();
  missionStarDocumentClickUnbind = undefined;
  const star = document.getElementById("mission-star");
  const bubble = document.getElementById("mission-star-bubble");
  const dock = document.getElementById("mission-star-dock");
  if (!star || !bubble || !dock) return;

  const isOpen = (): boolean => !bubble.hasAttribute("hidden");

  const open = (): void => {
    if (isOpen()) return;
    bubble.removeAttribute("hidden");
    star.setAttribute("aria-expanded", "true");
  };

  const toggle = (): void => {
    if (isOpen()) {
      closeMissionStarBubble();
    } else {
      open();
    }
  };

  star.addEventListener("click", (e: MouseEvent) => {
    e.stopPropagation();
    toggle();
  });

  const onDoc = (e: MouseEvent): void => {
    if (!isOpen()) return;
    if (dock.contains(e.target as Node)) return;
    closeMissionStarBubble();
  };
  document.addEventListener("click", onDoc);
  missionStarDocumentClickUnbind = () => {
    document.removeEventListener("click", onDoc);
  };
}

function bindProductFaq(): void {
  const faq = document.getElementById("product-faq");
  if (!faq) return;
  faq.addEventListener("click", (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".product-faq__pin");
    if (!btn || !faq.contains(btn)) return;
    const panelId = btn.getAttribute("aria-controls");
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const wasOpen = btn.getAttribute("aria-expanded") === "true";
    closeAllProductFaqPanels(faq);
    if (!wasOpen) {
      btn.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      clampFaqPanelToViewport(panel);
    }
  });
}

const PRODUCT_GALLERY_SWIPE_MIN_PX = 48;
/** Horizontal wheel delta before changing slide (trackpad two-finger swipe). */
const PRODUCT_GALLERY_WHEEL_STEP_PX = 36;
const PRODUCT_GALLERY_WHEEL_COOLDOWN_MS = 240;
/** Midpoint movement between two touches before changing slide. */
const PRODUCT_GALLERY_TWO_TOUCH_MIN_PX = 52;

function bindProductShotsCarousel(): void {
  const mainImg = document.querySelector<HTMLImageElement>("#product-gallery-main-img");
  const stage = document.getElementById("product-gallery-stage");
  const thumbs = Array.from(document.querySelectorAll<HTMLButtonElement>(".product-gallery__thumb"));
  if (!mainImg || !stage || thumbs.length < 1) return;

  const n = PRODUCT_CAROUSEL_SLIDES.length;
  let index = 0;

  const show = (i: number): void => {
    index = ((i % n) + n) % n;
    const slide = PRODUCT_CAROUSEL_SLIDES[index];
    mainImg.src = publicAssetUrl(slide.file);
    mainImg.alt = slide.alt;
    thumbs.forEach((btn, j) => {
      const on = j === index;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-current", on ? "true" : "false");
    });
  };

  thumbs.forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
    });
    btn.addEventListener("click", () => {
      const raw = btn.getAttribute("data-gallery-index");
      const i = raw ? parseInt(raw, 10) : 0;
      if (!Number.isNaN(i)) show(i);
    });
  });

  stage.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    show(e.key === "ArrowRight" ? index + 1 : index - 1);
  });

  /** Horizontal drag / swipe (mouse & touch) to change slide */
  let dragPointerId: number | null = null;
  let dragStartX = 0;
  let dragStartY = 0;

  const endDrag = (e: PointerEvent): void => {
    if (dragPointerId !== e.pointerId) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    dragPointerId = null;
    try {
      stage.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (n < 2) return;
    if (Math.abs(dx) < PRODUCT_GALLERY_SWIPE_MIN_PX) return;
    if (Math.abs(dx) <= Math.abs(dy)) return;
    if (dx < 0) show(index + 1);
    else show(index - 1);
  };

  stage.addEventListener("pointerdown", (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest(".product-gallery__thumb")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragPointerId = e.pointerId;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    try {
      stage.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  });

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  /** Two-finger trackpad / horizontal mouse wheel (deltaX). */
  let wheelAccumX = 0;
  let wheelCooldown = false;
  let wheelAccumResetTimer: number | undefined;
  stage.addEventListener(
    "wheel",
    (e: WheelEvent) => {
      if (n < 2 || wheelCooldown) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX < 0.5 && absY < 0.5) return;
      if (absY > absX * 1.25) {
        wheelAccumX = 0;
        return;
      }

      wheelAccumX += e.deltaX;
      window.clearTimeout(wheelAccumResetTimer);
      wheelAccumResetTimer = window.setTimeout(() => {
        wheelAccumX = 0;
      }, 140);

      if (Math.abs(wheelAccumX) < PRODUCT_GALLERY_WHEEL_STEP_PX) return;

      e.preventDefault();
      if (wheelAccumX < 0) show(index + 1);
      else show(index - 1);
      wheelAccumX = 0;
      wheelCooldown = true;
      window.setTimeout(() => {
        wheelCooldown = false;
      }, PRODUCT_GALLERY_WHEEL_COOLDOWN_MS);
    },
    { passive: false }
  );

  /** Two-finger horizontal swipe on touch screens. */
  let twoTouchMidX: number | null = null;
  stage.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 2) twoTouchMidX = null;
      else twoTouchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    },
    { passive: true }
  );
  stage.addEventListener(
    "touchmove",
    (e) => {
      if (n < 2 || e.touches.length !== 2 || twoTouchMidX === null) return;
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const dx = midX - twoTouchMidX;
      if (Math.abs(dx) < PRODUCT_GALLERY_TWO_TOUCH_MIN_PX) return;
      e.preventDefault();
      if (dx < 0) show(index + 1);
      else show(index - 1);
      twoTouchMidX = midX;
    },
    { passive: false }
  );
  stage.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) twoTouchMidX = null;
  });
  stage.addEventListener("touchcancel", () => {
    twoTouchMidX = null;
  });
}

function bindThanks(): void {
  document.querySelector("#thanks-home")?.addEventListener("click", () => {
    goLanding();
  });
}

window.addEventListener("popstate", () => {
  render();
});

window.addEventListener("hashchange", () => {
  const path = getAppPath();
  if (path !== "/" && path !== "/product" && path !== "/subscription") return;
  const h = location.hash;
  if (h === "#product-faq" || h === "#education" || h === "#site-footer") {
    requestAnimationFrame(() => scrollToHashSection());
  }
});

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key !== "Escape") return;
  if (closeMissionStarBubble()) {
    e.preventDefault();
    return;
  }
  const faq = document.getElementById("product-faq");
  if (faq?.querySelector('.product-faq__pin[aria-expanded="true"]')) {
    e.preventDefault();
    closeAllProductFaqPanels(faq);
    return;
  }
  const modal = document.getElementById("pdf-manual-modal");
  if (!modal || modal.hidden) return;
  e.preventDefault();
  closePdfManualModal();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) updateProductShippingEta();
});

render();
