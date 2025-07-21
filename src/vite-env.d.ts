/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_WEATHER_API_KEY: string;
  // other env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
