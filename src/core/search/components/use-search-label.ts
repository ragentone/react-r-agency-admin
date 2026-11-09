import { useTranslation } from 'react-i18next';

/** Translated label: `ns:key` / known key (e.g. `bundleLabels.<alias>`) / plain text. */
export const useSearchLabel = () => {
  const { t } = useTranslation('search');
  return (value: string, fallbackKey?: string) =>
    String(t(fallbackKey ?? value, { defaultValue: t(value, { defaultValue: value }) }));
};
