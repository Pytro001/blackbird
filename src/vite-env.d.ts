/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional: overrides `DEFAULT_STRIPE_PAYMENT_LINK` for the Buy button. */
  readonly VITE_STRIPE_PAYMENT_LINK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
