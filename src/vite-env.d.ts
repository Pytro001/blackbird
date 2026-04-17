/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional: Stripe Payment Link URL if `/api/create-checkout-session` is unavailable (e.g. plain `vite` dev). */
  readonly VITE_STRIPE_PAYMENT_LINK?: string;
  /** WhatsApp country + number, digits only (e.g. 491701234567). */
  readonly VITE_WHATSAPP_NUMBER?: string;
  /** Optional override for the pre-filled scalp-check message. */
  readonly VITE_WHATSAPP_MESSAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
