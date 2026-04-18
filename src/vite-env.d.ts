/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional: Stripe Payment Link URL if `/api/create-checkout-session` is unavailable (e.g. plain `vite` dev). */
  readonly VITE_STRIPE_PAYMENT_LINK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
