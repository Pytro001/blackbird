/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCALP_CHECK_URL?: string;
  readonly VITE_SCALP_FIELD_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
