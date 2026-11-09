import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { History, X } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { searchOptionId } from './use-search-panel';

export interface ISearchRecentProps {
  items: string[];
  activeIndex: number;
  onPick: (term: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
  onHover: (index: number) => void;
}

/** Recent search terms (tap = search again, X = remove). */
export const SearchRecent: React.FC<ISearchRecentProps> = ({
  items,
  activeIndex,
  onPick,
  onRemove,
  onClear,
  onHover,
}) => {
  const { t } = useTranslation('search');

  return (
    <section aria-labelledby="search-recent-title" className="pt-1">
      <div className="flex items-center justify-between px-4 py-2">
        <h3 id="search-recent-title" className="text-title font-bold">
          {t('recent')}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          {t('clearRecent')}
        </Button>
      </div>
      <ul id="search-listbox" role="listbox" aria-labelledby="search-recent-title">
        {items.map((item, i) => (
          <li
            key={item}
            role="presentation"
            className={cn(
              'flex items-center pe-2 transition-colors hover:bg-accent/50',
              i === activeIndex && 'bg-accent'
            )}
          >
            <button
              type="button"
              id={searchOptionId(i)}
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => onPick(item)}
              onMouseMove={() => onHover(i)}
              className="flex min-h-14 min-w-0 flex-1 items-center gap-3 px-4 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted">
                <History className="size-4" />
              </span>
              <span className="truncate text-body">{item}</span>
            </button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label={t('removeRecent', { term: item })}
              onClick={() => onRemove(item)}
            >
              <X />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
};
