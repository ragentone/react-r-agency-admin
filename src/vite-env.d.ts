/// <reference types="vite/client" />
// noinspection JSAnnotator

export type ViteMode = 'development' | 'production';

interface ImportMetaEnv {
  readonly VITE_MESH_SERVER_ENDPOINT: string;
  readonly VITE_MESH_CLIENT_ID: string;
  readonly VITE_MODE: ViteMode;
  readonly VITE_APP: {
    id: string;
  };
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
