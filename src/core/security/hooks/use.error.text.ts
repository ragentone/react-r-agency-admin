import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import type { IAuthResult } from '../types';

/** Error code → readable text (`security:errors.*`), stable between renders. */
export const useErrorText = () => {
  const { t } = useTranslation('security');
  return useCallback(
    (result: Pick<IAuthResult, 'error' | 'retryAfter'> | null | undefined): string | null => {
      if (!result?.error) return null;
      if (result.error === 'rate_limited' || result.retryAfter) {
        const seconds = Math.max(1, result.retryAfter ?? 60);
        return seconds >= 90
          ? t('errors.rate_limited_minutes', { count: Math.ceil(seconds / 60) })
          : t('errors.rate_limited', { count: seconds });
      }
      return t(`errors.${result.error}`, { defaultValue: t('errors.unknown') });
    },
    [t]
  );
};
