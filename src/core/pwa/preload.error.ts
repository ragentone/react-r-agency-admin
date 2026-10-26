import { PWA_PRELOAD_RELOAD_GAP_MS, PWA_STORAGE_PRELOAD_RELOAD } from './const';

const readLast = () => {
  try {
    return Number(sessionStorage.getItem(PWA_STORAGE_PRELOAD_RELOAD)) || 0;
  } catch {
    return 0;
  }
};
const writeLast = (value: number) => {
  try {
    sessionStorage.setItem(PWA_STORAGE_PRELOAD_RELOAD, String(value));
  } catch {
    /* private mode – ignore */
  }
};

let installed = false;

/**
 * After a deploy the old lazy chunks are gone → `vite:preloadError` ("Failed to fetch dynamically
 * imported module"). Reload once to get the new build instead of a broken page. Not when offline
 * and at most once a minute per tab – otherwise the error goes on to the error boundary.
 */
export const installPreloadErrorReload = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('vite:preloadError', event => {
    if (!navigator.onLine) return;
    const now = Date.now();
    if (now - readLast() < PWA_PRELOAD_RELOAD_GAP_MS) return;
    writeLast(now);
    event.preventDefault();
    console.warn('[pwa] missing chunk after a new version – reloading');
    window.location.reload();
  });
};
