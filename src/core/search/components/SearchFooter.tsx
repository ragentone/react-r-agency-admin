import type React from 'react';
import { useTranslation } from 'react-i18next';

import type { ISearchResult } from '../types';

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border/50 px-1 font-sans text-micro font-bold text-foreground">
    {children}
  </kbd>
);

/** Desktop: keyboard hints + result stats. Screen readers get the stats on every platform. */
export const SearchFooter: React.FC<{ result: ISearchResult | null }> = ({ result }) => {
  const { t } = useTranslation('search');
  const stats =
    result && !result.isEmpty
      ? t('stats', { count: result.total, ms: Math.round(Number(result.hrtime)) })
      : '';

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {stats}
      </p>
      <div className="hidden items-center justify-between border-t border-border/50 px-4 py-2.5 text-micro text-muted-foreground sm:flex">
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> {t('keys.navigate')}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> {t('keys.open')}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd> {t('keys.close')}
          </span>
        </span>
        {stats && <span className="tabular-nums">{stats}</span>}
      </div>
    </>
  );
};
