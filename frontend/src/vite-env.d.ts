/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_PORT: string;
  readonly VITE_APP_API_URL: string;
  readonly VITE_AGORA_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
