import { useSyncExternalStore } from 'react';

import type { BeforeInstallPromptEvent } from '../types';

/**
 * `beforeinstallprompt` can fire before React mounts → captured at module load
 * and exposed as a tiny external store.
 */
let deferred: BeforeInstallPromptEvent | null = null;
let installedNow = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); // we show our own UI
    deferred = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installedNow = true;
    emit();
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getDeferredInstallPrompt = () => deferred;
export const clearDeferredInstallPrompt = () => {
  deferred = null;
  emit();
};

/** Native prompt available + "was just installed" flag. */
export const useInstallPrompt = () => {
  const available = useSyncExternalStore(
    subscribe,
    () => deferred !== null,
    () => false
  );
  const justInstalled = useSyncExternalStore(
    subscribe,
    () => installedNow,
    () => false
  );
  return { available, justInstalled };
};

const media = (query: string) =>
  typeof window !== 'undefined' && window.matchMedia?.(query).matches;

/** Running as installed app. */
export const isStandalone = () =>
  media('(display-mode: standalone)') ||
  media('(display-mode: window-controls-overlay)') ||
  media('(display-mode: fullscreen)') ||
  (typeof navigator !== 'undefined' &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

/** iPhone / iPad Safari (incl. iPadOS that reports as Mac). */
export const isIosSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return ios && !otherBrowser;
};
