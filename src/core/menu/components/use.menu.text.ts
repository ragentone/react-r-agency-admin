import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Translates `ns:key` labels, plain strings are returned unchanged. */
export const useMenuText = () => {
  const { t } = useTranslation('menu');
  return useCallback(
    (value?: string) => (value ? String(t(value, { defaultValue: value })) : ''),
    [t]
  );
};
