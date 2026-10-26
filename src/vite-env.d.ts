/// <reference types="vite/client" />
// noinspection JSAnnotator

export type ViteMode = 'development' | 'production';

interface ImportMetaEnv {
  readonly VITE_MESH_SERVER_ENDPOINT: string;
  readonly VITE_MESH_CLIENT_ID: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_USER_INFO_URL: string;
  readonly VITE_GOOGLE_AUTH_URL: string;
  readonly VITE_GOOGLE_REDIRECT_URI_PATH: string;
  readonly VITE_MODE: ViteMode;
  readonly VITE_APP: {
    id: string;
  };
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
