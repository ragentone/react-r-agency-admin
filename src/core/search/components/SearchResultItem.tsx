import { cn } from '@ui/lib/utils';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SearchManager } from '../manager';
import type { ISearchItem } from '../types';
import { formatRelative } from './format';
import { SearchHighlight } from './SearchHighlight';
import { SearchResultMedia } from './SearchResultMedia';

export interface ISearchResultItemProps {
  item: ISearchItem;
  term: string;
  active: boolean;
  /** Something happens on select (registered handler or route). */
  actionable: boolean;
  onSelect: () => void;
  onHover: () => void;
  id: string;
}

/** One hit as X-style row: media, bold title, muted description · date. */
export const SearchResultItem: React.FC<ISearchResultItemProps> = ({
  item,
  term,
  active,
  actionable,
  onSelect,
  onHover,
  id,
}) => {
  const { i18n } = useTranslation('search');
  const group = SearchManager.getGroup(item.group);
  const date = item.date ? formatRelative(item.date, i18n.resolvedLanguage ?? i18n.language) : null;

  return (
    <li role="presentation">
      <button
        type="button"
        id={id}
        role="option"
        aria-selected={active}
        aria-disabled={!actionable}
        title={item.tooltip ?? undefined}
        onClick={() => actionable && onSelect()}
        onMouseMove={onHover}
        className={cn(
          'flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left outline-none transition-colors',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset active:bg-accent',
          active && 'bg-accent',
          !actionable && 'cursor-default opacity-60'
        )}
      >
        <SearchResultMedia item={item} group={group} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-bold text-foreground">
            <SearchHighlight
              text={item.title || '—'}
              term={term}
              className="underline underline-offset-2"
            />
          </span>
          {(item.description || date) && (
            <span className="block truncate text-body text-muted-foreground">
              {item.description && <SearchHighlight text={item.description} term={term} />}
              {item.description && date && ' · '}
              {date}
            </span>
          )}
        </span>
        {actionable && (
          <ChevronRight
            aria-hidden
            className={cn(
              'hidden size-4 shrink-0 text-muted-foreground transition-opacity sm:block',
              active ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
      </button>
    </li>
  );
};
