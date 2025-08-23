/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />
interface ImportMetaEnv {
  readonly VITE_API_IP: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
