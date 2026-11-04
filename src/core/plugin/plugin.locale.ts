import { useSyncExternalStore } from 'react';

import i18n from '@core/i18n';
import { allowedLocaleKeys, fallbackLocaleKey } from '@core/i18n/locale';

import type { PluginLocale } from './plugin.types';

/** Current UI language as a plugin locale. Unknown or missing languages fall back to English. */
export const currentLocale = (): PluginLocale => {
  const value = (i18n.resolvedLanguage ?? i18n.language ?? '').split('-')[0];
  return (allowedLocaleKeys as string[]).includes(value)
    ? (value as PluginLocale)
    : (fallbackLocaleKey as PluginLocale);
};

const subscribe = (listener: () => void) => {
  i18n.on('languageChanged', listener);
  return () => {
    i18n.off('languageChanged', listener);
  };
};

/** Hook for plugin components: the current UI language, re-renders when the user switches it. */
export const usePluginLocale = (): PluginLocale =>
  useSyncExternalStore(subscribe, currentLocale, currentLocale);
