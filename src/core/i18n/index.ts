// noinspection JSIgnoredPromiseFromCall
// noinspection JSIgnoredPromiseFromCall

import { allowedLocaleKeys, fallbackLocaleKey } from '@core/i18n/locale';
import LanguageDetector from 'i18next-browser-languagedetector';

import type { Locales } from './types.ts';

export * from './actions';
export * from './components';
export * from './hooks';
export * from './types.ts';

import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
// @ts-expect-error: ignore
import resources from 'virtual:i18next-loader';

const locales: Resource = {};

Object.keys(resources).map(ns => {
  const data = resources[ns];
  if (data) {
    Object.keys(data).map(lang => {
      // @ts-expect-error: ignore
      if (lang && allowedLocaleKeys.includes(lang)) {
        if (!locales[lang]) {
          locales[lang] = {};
        }
        locales[lang][ns] = data[lang];
        Object.keys(data[lang]).forEach(key => {
          const msg = data[lang][key];
          if (typeof msg === 'string' && /_/.test(key)) {
            if (!locales[lang]['backend']) {
              locales[lang]['backend'] = {};
            }
            // @ts-expect-error: ignore
            locales[lang]['backend'][key] = msg;
          }
        });
      }
    });
  }
});

if (i18n.isInitialized) {
  // Module re-evaluated (hot reload): don't init twice, just refresh the translations.
  Object.keys(locales).forEach(lang => {
    Object.keys(locales[lang]).forEach(ns => {
      i18n.addResourceBundle(lang, ns, locales[lang][ns], true, true);
    });
  });
} else {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: locales,
      fallbackLng: fallbackLocaleKey,
      // React escapes on render; i18next's own escaping would show `/` as `&#x2F;`
      // (toasts, titles, aria labels). Translations never go into innerHTML unsanitized.
      interpolation: { escapeValue: false },
      detection: {
        lookupLocalStorage: 'i18n-locale',
        lookupQuerystring: 'lng',
        convertDetectedLanguage: lng => {
          try {
            return lng.split('-')[0];
          } catch (e) {
            console.error((e as Error).message);
            return fallbackLocaleKey;
          }
        },
      },
    });
}

/** Search parameter that switches the language on app start, e.g. `/?app_lang=de`. */
export const APP_LANG_PARAM = 'app_lang';

/**
 * `?app_lang=<de|en|ru>` in the initial URL → switch to that language (stored like a manual
 * switch) and remove the parameter from the address bar. Unknown values are only removed.
 * Runs once on app start, before the router reads the location.
 */
const applyUrlLanguage = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(APP_LANG_PARAM)) return;

  const value = (url.searchParams.get(APP_LANG_PARAM) ?? '').trim().toLowerCase().split('-')[0];
  if (allowedLocaleKeys.includes(value as Locales) && value !== i18n.resolvedLanguage) {
    void i18n.changeLanguage(value);
  }

  url.searchParams.delete(APP_LANG_PARAM);
  // Keep the history state (router keys) – only the address changes, no new history entry.
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
};
applyUrlLanguage();

// <html lang> follows the UI language → correct hyphenation, quotes and screen reader voice.
const syncDocumentLanguage = (lng?: string) => {
  if (typeof document !== 'undefined' && lng) document.documentElement.lang = lng.split('-')[0];
};
syncDocumentLanguage(i18n.resolvedLanguage ?? i18n.language);
// Keep a single listener across hot reloads (the previous one is stored on globalThis).
const listenerStore = globalThis as { __i18nSyncDocumentLanguage?: (lng?: string) => void };
if (listenerStore.__i18nSyncDocumentLanguage) {
  i18n.off('languageChanged', listenerStore.__i18nSyncDocumentLanguage);
}
listenerStore.__i18nSyncDocumentLanguage = syncDocumentLanguage;
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
