import { cn } from '@ui/lib/utils';
import { ArrowUpRight, FileText } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { SearchManager } from '../manager';
import type { ISearchItem } from '../types';

/** Bold matches of the search term in a text. */
const Highlight = ({ text, term }: { text: string; term: string }) => {
  const query = term.trim();
  if (!query) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'ig'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded-[3px] bg-foreground/10 font-bold text-foreground">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

const relative = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, 'minute');
};

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

/** One hit: image / group icon, highlighted title, description, date. */
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
  const Icon = group?.icon ?? FileText;
  const date = item.date ? relative(item.date, i18n.resolvedLanguage ?? i18n.language) : null;

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
          'group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left outline-none transition-colors',
          active && 'bg-foreground/6',
          !actionable && 'cursor-default opacity-60'
        )}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            className={cn(
              'size-10 shrink-0 object-cover ring-1 ring-border/50',
              group?.roundImage ? 'rounded-full' : 'rounded-xl'
            )}
          />
        ) : (
          <span
            className={cn(
              'grid size-10 shrink-0 place-items-center bg-foreground/[0.05] text-foreground',
              group?.roundImage ? 'rounded-full' : 'rounded-xl'
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-semibold text-foreground">
            <Highlight text={item.title || '—'} term={term} />
          </span>
          {(item.description || date) && (
            <span className="block truncate text-caption text-muted-foreground">
              {item.description && <Highlight text={item.description} term={term} />}
              {item.description && date && ' · '}
              {date}
            </span>
          )}
        </span>
        {actionable && (
          <ArrowUpRight
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-opacity',
              active ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}
      </button>
    </li>
  );
};
