import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
// ---
import react from '@vitejs/plugin-react';
// ---
import path from 'path';
import { loadEnv, meshVitePlugin } from 'r-agency-mesh-client-v1/vite-release';
import ShortUniqueId from 'short-unique-id';
import { defineConfig, type PluginOption, type UserConfig } from 'vite';
import i18nextLoader from 'vite-plugin-i18next-loader';
import mkcert from 'vite-plugin-mkcert';
import { VitePWA } from 'vite-plugin-pwa';

import { graphqlTypesPlugin } from './vite/graphql/graphql.types.plugin';
import { autoImportPlugin } from './vite/import/app.auto.import.plugin';

// https://vite.dev/config/
export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  await loadEnv(mode);

  const uuid = new ShortUniqueId({ dictionary: 'number' });
  const appId = [uuid.rnd(4), uuid.rnd(8), uuid.rnd(4), uuid.rnd(2)].join('-');

  const pwaActive: boolean = true;
  // HTTPS for the dev server (local mkcert certificate). Needed when testing on a phone via
  // http://<LAN-IP>:3000 – camera/microphone (chat), geolocation and service workers only work
  // in a secure context. Start with: VITE_DEV_HTTPS=1 npm run dev
  const devCertActive: boolean = process.env.VITE_DEV_HTTPS === '1';
  const plugins: PluginOption[] = [
    autoImportPlugin({
      targetDir: ['./src/module', './src/core'],
    }),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/router/routes',
      generatedRouteTree: './generated/routerTree.tsx',
    }),
    i18nextLoader({
      paths: ['./src/module', './src/core', './src/ui'],
      namespaceResolution: 'basename',
      ignore: ['config.json'],
    }),
    react(),
    tailwindcss(),
    meshVitePlugin({
      printJson: mode === 'development',
      graphql: {
        maybeValue: 'T | null',
        documents: ['./src/**/*.ts'],
      },
      deployment: {
        name: 'react-app-admin',
        id: appId,
        // Shared secret with the runtime (DEPLOY_TOKEN in both .env.prod): only then the runtime
        // tells open clients about the new version. Goes to the runtime only, not into the bundle.
        token: process.env.DEPLOY_TOKEN || undefined,
      },
    }),
    // GraphQL schema → TypeScript interfaces in lib/types (regenerated on schema change)
    graphqlTypesPlugin({
      schema: './generated/schema.graphql',
      outDir: './lib/types',
    }),
  ];

  if (devCertActive) {
    plugins.push(mkcert());
  }

  if (pwaActive) {
    plugins.push(
      VitePWA({
        minify: true,
        mode: mode as never,
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
        manifest: {
          id: '/',
          name: 'r-agency',
          short_name: 'r-agency',
          description: 'r-agency platform application',
          theme_color: '#0a0a0a',
          background_color: '#0a0a0a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'android-chrome-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'android-chrome-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // No skipWaiting/clientsClaim: with `registerType: 'prompt'` the new worker waits until
          // the user clicks "Update" (core/pwa → PwaUpdateNotifier).
          cleanupOutdatedCaches: true,
          // Web Push: `push` / `notificationclick` handlers (public/push-sw.js, src/core/push).
          importScripts: ['push-sw.js'],
          maximumFileSizeToCacheInBytes: 25 * 1024 * 1024, // 25 MiB
        },
        devOptions: {
          // Disabled in dev: the dev service worker served a cached index.html and an old,
          // waiting worker (registerType 'prompt') stayed active → stale code after HMR / reload.
          enabled: true,
        },
      })
    );
  }

  return {
    define: {
      'import.meta.env.VITE_APP': JSON.stringify({
        id: appId,
        name: 'r-agency-mesh-platform',
      }),
    },
    // Build only: strip `debugger` and the noisy console calls. `console.warn` / `console.error`
    // stay, so errors remain visible in production. (In dev nothing is stripped.)
    esbuild:
      command === 'build'
        ? { drop: ['debugger'], pure: ['console.log', 'console.debug', 'console.info'] }
        : {},
    build: {
      manifest: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          // Only the content hash in the file names – no module / page / vendor names in the
          // build output (network tab shows e.g. `assets/Bx7kQ2aZ.js`). For readable names
          // temporarily use '[name].[hash]' (e.g. together with vite-bundle-analyzer).
          entryFileNames: 'assets/[hash].js',
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash][extname]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (
                /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store|react-is)[\\/]/.test(
                  id
                )
              ) {
                return 'vendor-react';
              }
              if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) {
                return 'vendor-tanstack';
              }
              if (/[\\/]node_modules[\\/](framer-motion|motion)[\\/]/.test(id)) {
                return 'vendor-motion';
              }
              if (/[\\/]node_modules[\\/](lucide-react|lucide)[\\/]/.test(id)) {
                return 'vendor-lucide';
              }
              if (/[\\/]node_modules[\\/](@radix-ui|radix-ui)[\\/]/.test(id)) {
                return 'vendor-radix';
              }
              if (/[\\/]node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor)[\\/]/.test(id)) {
                return 'vendor-recharts';
              }
              if (
                /[\\/]node_modules[\\/](leaflet|react-leaflet|leaflet-draw|leaflet\.fullscreen|leaflet\.markercluster|react-leaflet-markercluster)[\\/]/.test(
                  id
                )
              ) {
                return 'vendor-leaflet';
              }
              if (/[\\/]node_modules[\\/](@tiptap|prosemirror)/.test(id)) {
                return 'vendor-tiptap';
              }
              // No catch-all 'vendor' chunk: it was needed by the entry and therefore loaded
              // up front – including libraries only used on single pages (pdf, peerjs, emoji,
              // cropper …). Everything else is split by Rollup along the lazy routes.
            }
          },
        },
      },
    },
    plugins: plugins,
    server: {
      port: parseInt(process.env.VITE_DEV_SERVER_PORT || '3100'),
      //host: '0.0.0.0',
      host: true,
      open: true,
      strictPort: true,
      allowedHosts: true,
      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/App.tsx',
          './src/core/**/core.tsx',
          './src/module/**/module.tsx',
        ],
      },
      watch: {
        // /Volumes/Dev is APFS → native FSEvents work, no polling needed.
        ignored: [
          '**/dist/**',
          '**/dev-dist/**',
          '**/_to_delete/**',
          '**/.idea/**',
          '**/.tanstack/**',
        ],
      },
    },
    resolve: {
      alias: {
        '@ui': path.resolve(__dirname, './src/ui'),
        '@module': path.resolve(__dirname, './src/module'),
        '@generated': path.resolve(__dirname, './generated'),
        '@router': path.resolve(__dirname, './src/router'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@core': path.resolve(__dirname, './src/core'),
        '@lib': path.resolve(__dirname, './lib'),
      },
    },
  };
});
