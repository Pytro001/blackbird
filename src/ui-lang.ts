/** Site UI language when browser prefers German (`de*`); English otherwise. */
export type UiLang = "de" | "en";

export function detectUiLang(): UiLang {
  if (typeof navigator === "undefined") return "en";
  const primary = (navigator.languages?.[0] ?? navigator.language ?? "en").toLowerCase();
  return primary.startsWith("de") ? "de" : "en";
}

const copy = {
  en: {
    productName: "blackbird Men Dandruff Set",
    refillAfterPrefix: "Every refill after",
    buy: "Buy",
    checkout: "Checkout",
    freeShippingPrefix: "Free",
    shippingSuffix: "Delivery",
    returnLine: '<span class="product-shipping__free">Free</span> 30 Days Return',

    whatsappBlockHeadline: "Get a free Dermatologist Check",
    whatsappBlockLeadBefore: "Our set is for dry flakes. If you are not sure whether you have dry or oily flakes, ",
    whatsappBlockLeadAfter: " us.",

    howToUse: "How to use blackbird",
    sidebarAriaLabel: "Product details",
    dermatologistAriaLabel: "Dermatologist check via WhatsApp",

    carouselAlt1:
      "blackbird Men lineup: Daily Wash, Before Sleep, After Wash bottles",
    carouselAlt2: "blackbird After Wash: daily flake-free spray",
    carouselAlt3:
      "blackbird Daily Wash pair: two flake-free shampoo pump bottles",
    carouselAlt4:
      "blackbird brand frame: Before Sleep Overnight care typography",

    galleryThumbnailsAria: "Product photo thumbnails",
    galleryStageAria:
      "Product photos. Drag horizontally to change image, or use thumbnails.",
    galleryThumbAria: "Product photo",
    thumbAriaConnector: "of",

    heroScript: "get flake free",
    heroCtaNow: "NOW",
    skipEducation: "Skip to Education",
    skipLegalNav: "Skip links",
    skipLegalFooter: "Skip to legal information",

    faqHeading: "FAQ",
    faqImageAlt:
      "blackbird set: two Daily Wash bottles, After Wash spray, and Before Sleep spray",

    educationHeading: "Education",
    educationLead:
      "There are two types of dandruff: oily and dry. You need to know which one you have to select the right products.",
    educationOilyTitle: "Oily flakes",
    educationOilyText:
      "These are yellowish, greasy, and sticky. They stay on your scalp and hair. Your scalp makes too much oil and yeast grows too much.",
    educationDryTitle: "Dry flakes",
    educationDryText:
      "These are small white flakes that fall easily. Your scalp feels tight and itchy. Your scalp does not make enough oil and becomes too dry.",
    educationStats:
      "Roughly 50% of adults experience dandruff at some point in their lives. In other words, one out of every two people you meet has likely dealt with it. Dandruff tends to appear after puberty and can persist throughout adulthood, often peaking between the ages of 20 and 40. The condition is slightly more common in men.",

    missionBubble:
      "Every purchase helps two German guys to build tech to help humanity explore the universe.",
    missionStarAria: "Show a message from the team",

    footerMetaAria: "Legal",
    footerSupportBefore: "Any open questions? Message our support on ",
    footerSupportAfter: "",
    footerNavAria: "Legal information",

    thanksTitle: "Thank you",
    thanksLede: "Your order is confirmed.",
    thanksHome: "Home",

    pdfBackdropClose: "Close manual",
    pdfDialogAria: "blackbird user manual",
    pdfCloseBtn: "Close",
    pdfManualTitleEmbed: "blackbird user manual",
    pdfOpenNewTab: "Open manual in new tab",

    manualBack: "Back",
    manualStageAria: "Usage comic, click to turn pages",
    manualIntroAria: "How to use blackbird: click anywhere to start",
    manualIntroTitle: "How to use blackbird",
    manualIntroHint: "Click anywhere to start",
    manualEndLede: "Ready to try blackbird®?",
    manualEndCta: "Get your set",
    manualRestart: "Start again",
    manualEndTapAria: "Continue",

    legalFooterImpressum: "Imprint",
    legalFooterPrivacy: "Privacy",
    legalSupportWhatsAppAria: "",
  },

  de: {
    productName: "blackbird Men Anti-Schuppen Set",
    refillAfterPrefix: "Jede Nachfüllung ab",
    buy: "Kaufen",
    checkout: "Zur Kasse",
    freeShippingPrefix: "Kostenlos",
    shippingSuffix: "Versand",
    returnLine:
      '<span class="product-shipping__free">Gratis</span> 30 Tage Rückgabe',

    whatsappBlockHeadline: "Kostenlose Dermatologie-Einschätzung",
    whatsappBlockLeadBefore:
      "Unser Set ist für trockene Schuppen gedacht. Wenn du nicht sicher bist, ob du trockene oder fettige Schuppen hast, ",
    whatsappBlockLeadAfter: " uns.",

    howToUse: "So verwendest du blackbird",
    sidebarAriaLabel: "Produktdetails",
    dermatologistAriaLabel: "Hautärztlicher Check über WhatsApp",

    carouselAlt1:
      "blackbird Men Reihe: Daily Wash, Before Sleep und After Wash",
    carouselAlt2: "blackbird After Wash: tägliches Anti-Schuppen-Spray",
    carouselAlt3:
      "blackbird Daily Wash Duo: zwei tägliche Anti-Schuppen-Shampoo-Pumpflaschen",
    carouselAlt4: "blackbird Markenmotiv Before Sleep Typography",

    galleryThumbnailsAria: "Produktfotos (Vorschau)",
    galleryStageAria:
      "Produktfotos. Zum Wechseln wischen oder Vorschaubilder nutzen.",
    galleryThumbAria: "Produktfoto",
    thumbAriaConnector: "von",

    heroScript: "werde schuppenfrei",
    heroCtaNow: "JETZT",
    skipEducation: "Zu Education springen",
    skipLegalNav: "Sprungmarken",
    skipLegalFooter: "Zu rechtlichen Hinweisen springen",

    faqHeading: "FAQ",
    faqImageAlt:
      "blackbird Set: zwei Daily Wash Flaschen, After Wash und Before Sleep Spray",

    educationHeading: "Wissen",
    educationLead:
      "Schuppen sind entweder fett oder trocken. Du solltest wissen, welche Art du hast, um die richtigen Produkte zu wählen.",
    educationOilyTitle: "Fettige Schuppen",
    educationOilyText:
      "Sie sind gelblich, klebrig und fettig und bleiben auf Kopfhaut und Haaren. Die Kopfhaut produziert zu viel Talg, und Hefe wächst stärker mit.",
    educationDryTitle: "Trockene Schuppen",
    educationDryText:
      "Kleine weiße Schuppen, die leicht fallen. Die Kopfhaut spannt und juckt. Es wird nicht genug Öl gebildet – sie ist zu trocken.",
    educationStats:
      "Etwa die Hälfte der Erwachsenen hat irgendwann Schuppen. Mit anderen Worten: Jede zweite Person, der du begegnest, kennt das vermutlich. Schuppen treten oft nach der Pubertät auf und können noch im Erwachsenenalter bestehen bleiben, häufig mit einem Höhepunkt zwischen 20 und 40 Jahren — bei Männern etwas häufiger.",

    missionBubble:
      "Jeder Kauf hilft zwei Deutschen beim Aufbau von Technik für die Erforschung des Universums.",
    missionStarAria: "Nachricht vom Team anzeigen",

    footerMetaAria: "Rechtliches",
    footerSupportBefore:
      "Noch Fragen? Schreib unsere Supportcrew auf ",
    footerSupportAfter: "",
    footerNavAria: "Rechtliche Hinweise",

    thanksTitle: "Danke",
    thanksLede: "Deine Bestellung ist bestätigt.",
    thanksHome: "Start",

    pdfBackdropClose: "Anleitung schließen",
    pdfDialogAria: "blackbird Gebrauchsanleitung",
    pdfCloseBtn: "Schließen",
    pdfManualTitleEmbed: "blackbird Gebrauchsanleitung",
    pdfOpenNewTab: "Anleitung in neuem Tab öffnen",

    manualBack: "Zurück",
    manualStageAria: "Comic zur Anwendung — Klick zum Blättern",
    manualIntroAria: "So geht blackbird — irgendwo klicken zum Start",
    manualIntroTitle: "So verwendest du blackbird",
    manualIntroHint: "Überall tippen zum Start",
    manualEndLede: "blackbird® ausprobieren?",
    manualEndCta: "Jetzt zum Set",
    manualRestart: "Nochmal von vorn",
    manualEndTapAria: "Weiter",

    legalFooterImpressum: "Impressum",
    legalFooterPrivacy: "Datenschutz",
    legalSupportWhatsAppAria: "",
  },
} as const;

export type UiKey = keyof typeof copy.en;

/** All UI literals for the detected language. */
export function strings(lang: UiLang): Record<UiKey, string> {
  return copy[lang];
}

const faqBundles = {
  en: [
    {
      id: "what-is",
      question: "What is this?",
      pinLabel: "What is this?",
      answer:
        "After my flight I opened my bag and found shampoo all over it. Never again.\n\nWe installed pump locks. Twist it to shut the spray when you are traveling.",
    },
    {
      id: "two-bottles",
      question: "Why two daily washes?",
      pinLabel: "Why two daily washes?",
      answer:
        "Airport security once threw my shampoo away. Never again.\n\nBoth are 100ml, you can take them wherever you want.",
    },
    {
      id: "why-spray",
      question: "Why spray?",
      pinLabel: "Why spray?",
      answer:
        "Spray gets the formula straight to your scalp. Same motion as hairspray and done in seconds.",
    },
  ],
  de: [
    {
      id: "what-is",
      question: "Was ist das?",
      pinLabel: "Was ist das?",
      answer:
        "Nach dem Flug war meine Tasche voller Shampoo – nie wieder.\n\nDeshalb gibt’s Pump-Verriegelungen und du kannst Spray und Spender zuverlässig schließen, auch auf Reisen.",
    },
    {
      id: "two-bottles",
      question: "Warum zwei tägliche Wäschen?",
      pinLabel: "Zwei tägliche Wäschen?",
      answer:
        "Am Flughafen haben sie mir das Shampoo weggeworfen – nie wieder.\n\nBeide Flaschen sind 100 ml — du kannst sie überall mitnehmen.",
    },
    {
      id: "why-spray",
      question: "Warum Spray?",
      pinLabel: "Warum Spray?",
      answer:
        "Spray verteilt die Formel direkt auf der Kopfhaut – ähnlich wie Haarspray, in Sekunden erledigt.",
    },
  ],
} as const;

const faqSub = {
  en: {
    id: "subscription",
    question: "Subscription",
    pinLabel: "Subscription",
    answer:
      "Your scalp should have consistency. When your bottles run empty, we send the next full set.",
  },
  de: {
    id: "subscription",
    question: "Abo",
    pinLabel: "Abo",
    answer:
      "Deine Routine sollte zusammenhalten. Sind die Flaschen leer, schicken wir dir das nächste komplette Set.",
  },
} as const;

export type ProductFaqItemBase = {
  id: string;
  question: string;
  pinLabel: string;
  answer: string;
};

export type ProductFaqPanelPlace = "above" | "below" | "left" | "right";

export type ProductFaqItem = ProductFaqItemBase & {
  pinTop: string;
  pinLeft: string;
  panel: ProductFaqPanelPlace;
};

type PinSlot = Omit<ProductFaqItem, "question" | "pinLabel" | "answer">;

const PIN_SLOTS: readonly PinSlot[] = [
  { id: "what-is", pinTop: "47%", pinLeft: "23%", panel: "below" },
  { id: "two-bottles", pinTop: "28%", pinLeft: "38%", panel: "above" },
  { id: "why-spray", pinTop: "30%", pinLeft: "77%", panel: "above" },
  { id: "subscription", pinTop: "63%", pinLeft: "80%", panel: "above" },
];

export function localizedFaqItems(
  mode: "purchase" | "subscription",
  lang: UiLang
): ProductFaqItem[] {
  const base = [...faqBundles[lang]];
  const sub = faqSub[lang];
  const textItems = mode === "subscription" ? [...base, sub] : base;
  const byId: Record<string, ProductFaqItemBase> = Object.fromEntries(textItems.map((x) => [x.id, x]));
  const slots =
    mode === "subscription"
      ? PIN_SLOTS
      : PIN_SLOTS.filter((s) => s.id !== "subscription");
  const out: ProductFaqItem[] = [];
  for (const slot of slots) {
    const t = byId[slot.id];
    if (!t) continue;
    out.push({ ...slot, ...t });
  }
  return out;
}
