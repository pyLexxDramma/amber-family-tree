/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VISION_IA_NAV?: string;
  readonly VITE_VISION_IA_HOME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
