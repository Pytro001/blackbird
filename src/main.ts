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

/** Default Stripe Payment Link when Checkout API is unavailable (local dev, or API error). */
const DEFAULT_STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/7sY14o2uDdBI0UE6Dtfbq02";

/** Shown next to Buy; keep in sync with your Stripe Price amount. */
const PRODUCT_PRICE_EUR = 69.99;
const productPriceDisplay = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
}).format(PRODUCT_PRICE_EUR);

type View =
  | "landing"
  | "product"
  | "thanks"
  | "manual"
  | "impressum"
  | "datenschutz"
  | "agb"
  | "widerruf";

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

const PDF_MANUAL_URL = `${BASE_HREF}blackbird_user_manual.pdf#toolbar=0`;

function pdfManualModalHtml(): string {
  return `
    <div class="pdf-modal" id="pdf-manual-modal" hidden>
      <button type="button" class="pdf-modal__backdrop" id="pdf-manual-backdrop" aria-label="Close manual"></button>
      <div class="pdf-modal__sheet" role="dialog" aria-modal="true" aria-label="BlackBird user manual">
        <iframe
          class="pdf-modal__iframe"
          id="pdf-manual-iframe"
          title="BlackBird user manual"
          src="about:blank"
        ></iframe>
      </div>
    </div>`;
}

function openPdfManualModal(): void {
  const modal = document.getElementById("pdf-manual-modal");
  const iframe = document.querySelector<HTMLIFrameElement>("#pdf-manual-iframe");
  if (!modal || !iframe) return;
  if (!iframe.src || iframe.src === "about:blank") {
    iframe.src = PDF_MANUAL_URL;
  }
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closePdfManualModal(): void {
  document.body.style.overflow = "";
  const modal = document.getElementById("pdf-manual-modal");
  if (modal) modal.hidden = true;
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
  if (path === "/impressum") return "impressum";
  if (path === "/datenschutz") return "datenschutz";
  if (path === "/agb") return "agb";
  if (path === "/widerruf") return "widerruf";
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
    question: "What is this product?",
    pinLabel: "What is this?",
    answer:
      "Daily Wash is your flake-free shampoo step: gentle cleansing formulated to support a healthy scalp routine.",
    pinTop: "28%",
    pinLeft: "44%",
    panel: "above",
  },
  {
    id: "two-bottles",
    question: "Why two Daily Wash bottles?",
    pinLabel: "Two bottles?",
    answer:
      "Two Daily Wash bottles keep your routine consistent. Use one at home and keep a spare for travel or backup so you never skip a wash.",
    pinTop: "46%",
    pinLeft: "26%",
    panel: "above",
  },
  {
    id: "why-spray",
    question: "Why a spray?",
    pinLabel: "Why spray?",
    answer:
      "The After Wash spray spreads a light, even layer without rubbing, so your scalp gets care where it needs it with a clean, dry feel.",
    pinTop: "68%",
    pinLeft: "52%",
    panel: "above",
  },
  {
    id: "how-long",
    question: "How long will it last?",
    pinLabel: "How long?",
    answer:
      "Usage varies by hair length and routine; most people plan for several weeks per bottle when used as directed.",
    pinTop: "46%",
    pinLeft: "78%",
    panel: "above",
  },
];

function closeAllProductFaqPanels(faq: HTMLElement): void {
  faq.querySelectorAll<HTMLButtonElement>(".product-faq__pin").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    const id = btn.getAttribute("aria-controls");
    if (id) {
      const p = document.getElementById(id);
      if (p) p.hidden = true;
    }
  });
}

function productFaqSectionHtml(): string {
  const spots = PRODUCT_FAQ_ITEMS.map((item) => {
    const panelId = `product-faq-panel-${item.id}`;
    const btnId = `product-faq-btn-${item.id}`;
    return `
          <div
            class="product-faq__spot"
            style="--pin-top:${item.pinTop};--pin-left:${item.pinLeft};"
          >
            <div
              class="product-faq__panel product-faq__panel--${item.panel}"
              id="${panelId}"
              role="region"
              hidden
              aria-labelledby="${btnId}"
            >
              <p class="product-faq__answer">${escapeHtml(item.answer)}</p>
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
      <h2 id="product-faq-heading" class="product-faq__heading product-faq__heading--script">Q&amp;A</h2>
      <div class="product-faq__figure">
        <img
          class="product-faq__img"
          src="${BASE_HREF}faq-four-bottles.png"
          width="1024"
          height="576"
          alt="BLACKBIRD set: two Daily Wash bottles, After Wash spray, and Before Sleep spray"
          decoding="async"
          loading="lazy"
        />
        <div class="product-faq__spots">${spots}</div>
      </div>
      <div class="product-faq__education">
        <h3 class="product-faq__edu-title product-faq__edu-title--script">Education</h3>
        <p class="product-faq__edu-lead">
          There are two types of dandruff: oily and dry. You need to find out which one you have to select the right products.
        </p>
        <div class="product-faq__edu-grid">
          <div class="product-faq__edu-card">
            <h4 class="product-faq__edu-sub">Oily flakes</h4>
            <p class="product-faq__edu-text">
              These are yellowish, greasy, and sticky. They stay on your scalp and hair. Your scalp makes too much oil and yeast grows too much.
            </p>
          </div>
          <div class="product-faq__edu-card">
            <h4 class="product-faq__edu-sub">Dry flakes</h4>
            <p class="product-faq__edu-text">
              These are small white flakes that fall easily. Your scalp feels tight and itchy. Your scalp does not make enough oil and becomes too dry.
            </p>
          </div>
        </div>
        <p class="product-faq__edu-stats">
          Roughly 50% of adults experience dandruff at some point in their lives. In other words, one out of every two people you meet has likely dealt with it. Dandruff tends to appear after puberty and can persist throughout adulthood, often peaking between the ages of 20 and 40. The condition is slightly more common in men.
        </p>
      </div>
    </section>`;
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
            aria-label="Product photos. Drag, swipe, or use arrow keys."
            tabindex="0"
          >
            <figure class="product-shot">
              <img
                draggable="false"
                src="${BASE_HREF}product-slide-01.png"
                width="1024"
                height="819"
                alt="BLACKBIRD: Daily Wash, After Wash, and Before Sleep bottles"
                decoding="async"
              />
            </figure>
            <figure class="product-shot">
              <img
                draggable="false"
                src="${BASE_HREF}product-slide-02.png"
                width="1024"
                height="819"
                alt="BLACKBIRD After Wash: daily flake-free spray"
                decoding="async"
              />
            </figure>
            <figure class="product-shot">
              <img
                draggable="false"
                src="${BASE_HREF}product-slide-03.png"
                width="1024"
                height="819"
                alt="BLACKBIRD Before Sleep: overnight care spray"
                decoding="async"
              />
            </figure>
            <figure class="product-shot">
              <img
                draggable="false"
                src="${BASE_HREF}product-slide-04.png"
                width="1024"
                height="819"
                alt="BLACKBIRD gift set: four products in presentation box"
                decoding="async"
              />
            </figure>
          </div>
          <div class="product-shots-dots" id="product-shots-dots" role="tablist" aria-label="Choose photo">
            <button type="button" class="product-shots-dot is-active" role="tab" aria-selected="true" aria-label="Photo 1 of 4" data-slide="0" id="product-dot-0"></button>
            <button type="button" class="product-shots-dot" role="tab" aria-selected="false" aria-label="Photo 2 of 4" data-slide="1" id="product-dot-1"></button>
            <button type="button" class="product-shots-dot" role="tab" aria-selected="false" aria-label="Photo 3 of 4" data-slide="2" id="product-dot-2"></button>
            <button type="button" class="product-shots-dot" role="tab" aria-selected="false" aria-label="Photo 4 of 4" data-slide="3" id="product-dot-3"></button>
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
            <button type="button" class="btn-howto" id="product-howto-open">How to use BlackBird</button>
          </div>
        </aside>
      </main>
    </div>
    ${productFaqSectionHtml()}
    ${siteLegalFooterHtml()}
    ${pdfManualModalHtml()}
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

function siteLegalFooterHtml(): string {
  const i = `${BASE_HREF}impressum`;
  const d = `${BASE_HREF}datenschutz`;
  const a = `${BASE_HREF}agb`;
  const w = `${BASE_HREF}widerruf`;
  return `
    <footer class="site-legal-footer" id="site-footer" aria-label="Rechtliches">
      <p class="site-legal-footer__company">
        HUGE Production GmbH · Sebnitzer Str. 35 · 01099 Dresden
      </p>
      <p class="site-legal-footer__contact">
        E-Mail:
        <a href="mailto:invite@hugeconversations.com">invite@hugeconversations.com</a>
      </p>
      <nav class="site-legal-footer__nav" aria-label="Rechtliche Hinweise">
        <a href="${i}">Impressum</a>
        <span class="site-legal-footer__sep" aria-hidden="true">·</span>
        <a href="${d}">Datenschutz</a>
        <span class="site-legal-footer__sep" aria-hidden="true">·</span>
        <a href="${a}">AGB</a>
        <span class="site-legal-footer__sep" aria-hidden="true">·</span>
        <a href="${w}">Widerruf</a>
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
    <h2 class="legal-h2">Kontakt</h2>
    <p>
      E-Mail:
      <a href="mailto:invite@hugeconversations.com">invite@hugeconversations.com</a>
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
      Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
    </p>
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
      E-Mail: <a href="mailto:invite@hugeconversations.com">invite@hugeconversations.com</a>
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
    <h2 class="legal-h2">WhatsApp</h2>
    <p>
      Wenn Sie über einen Link auf unserer Website WhatsApp (Meta) nutzen, gelten die dortigen Nutzungs- und Datenschutzbedingungen des jeweiligen Anbieters. Wir haben keinen Einfluss auf die Datenverarbeitung durch Meta/WhatsApp außerhalb unserer Website.
    </p>
    <h2 class="legal-h2">Kontaktaufnahme per E-Mail</h2>
    <p>
      Wenn Sie uns per E-Mail kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen bzw. Vertrag) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung).
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

function agbHtml(): string {
  const body = `
    <p class="legal-lead">Allgemeine Geschäftsbedingungen (AGB) für den Online-Kauf über diese Website</p>
    <h2 class="legal-h2">§ 1 Geltungsbereich</h2>
    <p>
      Diese AGB gelten für Verträge zwischen HUGE Production GmbH (nachfolgend „Anbieter“) und Verbraucherinnen und Verbrauchern (nachfolgend „Kunde“) über die über diese Website angebotenen Waren.
    </p>
    <h2 class="legal-h2">§ 2 Vertragsschluss</h2>
    <p>
      Die Darstellung der Produkte auf der Website stellt kein rechtlich bindendes Angebot dar. Die Bestellung des Kunden stellt ein Angebot zum Abschluss eines Kaufvertrags dar. Der Vertrag kommt zustande, sobald der Anbieter die Bestellung annimmt oder die Ware ausliefert oder der Kunde zur Zahlung per Zahlungsdienstleister weitergeleitet wird und die Zahlung ordnungsgemäß erfolgt – je nach technischem Ablauf des Bestellvorgangs.
    </p>
    <h2 class="legal-h2">§ 3 Preise und Versandkosten</h2>
    <p>
      Es gelten die zum Zeitpunkt der Bestellung auf der Website angegebenen Preise und Versandbedingungen. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern ausgewiesen.
    </p>
    <h2 class="legal-h2">§ 4 Zahlung</h2>
    <p>
      Die Zahlung erfolgt über den angegebenen Zahlungsdienstleister (z.&nbsp;B. Stripe). Es gelten dabei die jeweiligen Bedingungen des Zahlungsdienstleisters.
    </p>
    <h2 class="legal-h2">§ 5 Lieferung</h2>
    <p>
      Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse innerhalb der angegebenen Fristen, sofern nichts Abweichendes vereinbart ist.
    </p>
    <h2 class="legal-h2">§ 6 Gewährleistung</h2>
    <p>
      Es gelten die gesetzlichen Gewährleistungsrechte. Für Verbraucher beträgt die Gesetzliche Verjährungsfrist für Mängelansprüche bei neuen Waren zwei Jahre ab Lieferung der Ware.
    </p>
    <h2 class="legal-h2">§ 7 Haftung</h2>
    <p>
      Die Haftung des Anbieters richtet sich nach den gesetzlichen Vorschriften, soweit ausgeschlossen nicht zulässig ist. Für leichte Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den typischen, vorhersehbaren Schaden.
    </p>
    <h2 class="legal-h2">§ 8 Schlussbestimmungen</h2>
    <p>
      Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Staates, in dem der Kunde seinen gewöhnlichen Aufenthalt hat, bleiben unberührt, sofern anwendbar.
      Gerichtsstand und Erfüllungsort bei Verträgen mit Kaufleuten sind, soweit zulässig, der Sitz des Anbieters.
    </p>
    <p>
      <strong>Hinweis:</strong> Passen Sie diese AGB bei Bedarf an Ihren konkreten Vertrags- und Checkout-Prozess an (z.&nbsp;B. Bestellbestätigung, Lieferländer, Streitbeilegung).
    </p>
  `;
  return legalPageShell("AGB", body);
}

function widerrufHtml(): string {
  const body = `
    <p class="legal-lead">Widerrufsbelehrung für Verbraucherinnen und Verbraucher</p>
    <h2 class="legal-h2">Widerrufsrecht</h2>
    <p>
      Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
    </p>
    <p>
      Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (HUGE Production GmbH, Sebnitzer Str. 35, 01099 Dresden, E-Mail:
      <a href="mailto:invite@hugeconversations.com">invite@hugeconversations.com</a>)
      mittels einer eindeutigen Erklärung (z.&nbsp;B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
    </p>
    <h2 class="legal-h2">Folgen des Widerrufs</h2>
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
    <h2 class="legal-h2">Muster-Widerrufsformular</h2>
    <p>
      Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus und senden Sie es zurück.
    </p>
    <pre class="legal-pre" aria-label="Muster-Widerrufsformular">An HUGE Production GmbH, Sebnitzer Str. 35, 01099 Dresden, E-Mail: invite@hugeconversations.com

Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)

Bestellt am (*)/erhalten am (*)

Name des/der Verbraucher(s)

Anschrift des/der Verbraucher(s)

Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)

Datum

(*) Unzutreffendes streichen.</pre>
  `;
  return legalPageShell("Widerruf", body);
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
        <div class="manual-intro" id="manual-intro" role="button" tabindex="0" aria-label="How to use BlackBird: click anywhere to start">
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

function setDocumentLang(view: View): void {
  const de =
    view === "impressum" ||
    view === "datenschutz" ||
    view === "agb" ||
    view === "widerruf";
  document.documentElement.lang = de ? "de" : "en";
}

function render(): void {
  closePdfManualModal();
  destroyManualPageFlip();
  removeManualEndTap();
  const path = getAppPath();
  if (path === "/email") {
    history.replaceState(null, "", `${BASE_HREF}#product`);
  } else if (path === "/admin" || path.startsWith("/admin/")) {
    history.replaceState(null, "", BASE_HREF);
  }

  const view = pathToView();
  setDocumentLang(view);

  if (view === "landing" || view === "product") {
    root.innerHTML = homeHtml();
    bindLanding();
    bindProduct();
    const scrollProduct =
      view === "product" || (view === "landing" && location.hash === "#product");
    if (scrollProduct) {
      scrollToProduct(view === "product" ? "auto" : "smooth");
    } else if (location.hash === "#product-faq") {
      requestAnimationFrame(() => {
        document.getElementById("product-faq")?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  } else if (view === "manual") {
    root.innerHTML = manualHtml();
    bindManual();
  } else if (view === "thanks") {
    root.innerHTML = thanksHtml();
  } else if (view === "impressum") {
    root.innerHTML = impressumHtml();
  } else if (view === "datenschutz") {
    root.innerHTML = datenschutzHtml();
  } else if (view === "agb") {
    root.innerHTML = agbHtml();
  } else if (view === "widerruf") {
    root.innerHTML = widerrufHtml();
  }

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

  document.querySelector("#product-howto-open")?.addEventListener("click", () => {
    openPdfManualModal();
  });

  document.querySelector("#pdf-manual-backdrop")?.addEventListener("click", () => {
    closePdfManualModal();
  });

  bindProductShotsCarousel();
  bindProductFaq();
  updateProductShippingEta();
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
    }
  });
}

function bindProductShotsCarousel(): void {
  const scroller = document.querySelector<HTMLDivElement>("#product-shots");
  const dots = document.querySelectorAll<HTMLButtonElement>("#product-shots-dots .product-shots-dot");
  const slides = scroller?.querySelectorAll<HTMLElement>(".product-shot");
  if (!scroller || !slides?.length || dots.length !== slides.length) return;

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
      dots.forEach((d, j) => {
        d.classList.toggle("is-active", j === i);
        d.setAttribute("aria-selected", j === i ? "true" : "false");
      });
      scroller.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
    });
  });

  scroller.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const idx = slideIndex();
    const next =
      e.key === "ArrowRight" ? Math.min(slides.length - 1, idx + 1) : Math.max(0, idx - 1);
    goToIndex(next, "smooth");
  });

  /* Drag with mouse / trackpad to scroll horizontally (desktop) */
  let dragPointerId: number | null = null;
  let dragStartX = 0;
  let scrollStart = 0;

  const onPointerMove = (e: PointerEvent): void => {
    if (dragPointerId !== e.pointerId) return;
    scroller.scrollLeft = scrollStart - (e.clientX - dragStartX);
  };

  const endDrag = (e: PointerEvent): void => {
    if (dragPointerId !== e.pointerId) return;
    dragPointerId = null;
    scroller.classList.remove("product-shots--dragging");
    try {
      scroller.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    scroller.removeEventListener("pointermove", onPointerMove);
    scroller.removeEventListener("pointerup", endDrag);
    scroller.removeEventListener("pointercancel", endDrag);
  };

  scroller.addEventListener("pointerdown", (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (e.button !== 0) return;
    dragPointerId = e.pointerId;
    dragStartX = e.clientX;
    scrollStart = scroller.scrollLeft;
    scroller.classList.add("product-shots--dragging");
    scroller.setPointerCapture(e.pointerId);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", endDrag);
    scroller.addEventListener("pointercancel", endDrag);
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

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key !== "Escape") return;
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

render();
