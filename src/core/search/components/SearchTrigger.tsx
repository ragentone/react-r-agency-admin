import { cn } from '@ui/lib/utils';
import { Search } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SearchManager } from '../manager';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Fake search field that opens the search dialog (e.g. above a feed or in a sidebar). */
export const SearchTrigger: React.FC<{ className?: string; compact?: boolean }> = ({
  className,
  compact,
}) => {
  const { t } = useTranslation('search');
  return (
    <button
      type="button"
      onClick={() => SearchManager.open()}
      aria-label={t('title')}
      className={cn(
        'group flex h-11 items-center gap-2.5 rounded-full bg-foreground/[0.06] text-muted-foreground transition-colors hover:bg-foreground/[0.09] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        compact ? 'w-11 justify-center' : 'w-full px-4',
        className
      )}
    >
      <Search className="size-[18px] shrink-0" />
      {!compact && (
        <>
          <span className="flex-1 truncate text-left text-body">{t('placeholder')}</span>
          <kbd className="hidden h-5 items-center rounded border border-border/50 px-1.5 text-micro font-semibold sm:inline-flex">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </>
      )}
    </button>
  );
};
