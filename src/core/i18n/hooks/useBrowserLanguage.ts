import { fallbackLocaleKey } from '@core/i18n/locale';
import { useEffect, useState } from 'react';

const getBrowserLanguages = (): string[] => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return [];
  }

  const langs: string[] = [];
  if (Array.isArray(navigator.languages)) {
    langs.push(...navigator.languages);
  }
  if (navigator.language) {
    langs.push(navigator.language);
  }

  return Array.from(new Set(langs.filter(Boolean).map(String)));
};

const normalize = (lng: string) => {
  try {
    return lng.split('-')[0]?.toLowerCase();
  } catch {
    return undefined;
  }
};

const detectSupportedLanguage = () => {
  const langs = getBrowserLanguages();
  for (const lng of langs) {
    const normalized = normalize(lng);
    if (normalized) {
      return normalized;
    }
  }
  return fallbackLocaleKey;
};

/**
 * Returns the browser's preferred (supported) language key, normalized to a 2-letter code.
 * It updates on the `languagechange` event.
 */
const useBrowserLanguage = () => {
  const [language, setLanguage] = useState<string>(() => detectSupportedLanguage());

  useEffect(() => {
    const handler = () => setLanguage(detectSupportedLanguage());
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  const languages = getBrowserLanguages();

  return { language, languages };
};

export { useBrowserLanguage };
