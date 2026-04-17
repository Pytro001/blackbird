/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Optional: Stripe Payment Link URL if `/api/create-checkout-session` is unavailable (e.g. plain `vite` dev). */
  readonly VITE_STRIPE_PAYMENT_LINK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
