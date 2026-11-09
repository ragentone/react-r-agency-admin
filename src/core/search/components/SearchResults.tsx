import { cn } from '@ui/lib/utils';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { SearchManager } from '../manager';
import type { ISearchGroup, ISearchItem } from '../types';
import { SearchResultItem } from './SearchResultItem';
import { useSearchLabel } from './use-search-label';
import { isSearchItemActionable, searchOptionId } from './use-search-panel';

export interface ISearchResultsProps {
  groups: ISearchGroup[];
  offsets: number[];
  term: string;
  activeIndex: number;
  /** Results of an older term while the new one loads. */
  stale: boolean;
  onHover: (index: number) => void;
  onSelect: (item: ISearchItem) => void;
}

/** Hits grouped by type (people, posts, …), separated like X sections. */
export const SearchResults: React.FC<ISearchResultsProps> = ({
  groups,
  offsets,
  term,
  activeIndex,
  stale,
  onHover,
  onSelect,
}) => {
  const { t } = useTranslation('search');
  const label = useSearchLabel();

  return (
    <div
      id="search-listbox"
      role="listbox"
      aria-label={t('results')}
      aria-busy={stale || undefined}
      className={cn('transition-opacity motion-reduce:transition-none', stale && 'opacity-50')}
    >
      {groups.map((group, groupIndex) => {
        const config = SearchManager.getGroup(group.name);
        const headingId = `search-group-${group.name}`;
        return (
          <section
            key={group.name}
            role="group"
            aria-labelledby={headingId}
            className="border-b border-border/50 last:border-b-0"
          >
            <h3 id={headingId} className="flex items-baseline gap-2 px-4 pt-3 pb-1">
              <span className="text-title font-bold">
                {label(config?.label ?? group.label, config ? undefined : `groups.${group.name}`)}
              </span>
              <span className="text-caption text-muted-foreground tabular-nums">
                {group.items.length}
              </span>
            </h3>
            <ul role="presentation">
              {group.items.map((item, itemIndex) => {
                const i = offsets[groupIndex] + itemIndex;
                return (
                  <SearchResultItem
                    key={item.id ?? `${group.name}-${i}`}
                    id={searchOptionId(i)}
                    item={item}
                    term={term}
                    active={i === activeIndex}
                    actionable={isSearchItemActionable(item)}
                    onHover={() => onHover(i)}
                    onSelect={() => onSelect(item)}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
