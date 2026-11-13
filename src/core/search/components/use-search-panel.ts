import { useRouter } from '@tanstack/react-router';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useSearch } from '../hooks/use.search';
import { useSearchConfig } from '../hooks/use.search.config';
import { useRecentSearches } from '../hooks/use.search.recent';
import { executeSearchItem, SearchManager } from '../manager';
import { useSearchUi } from '../store';
import type { ISearchGroup, ISearchItem } from '../types';

/** DOM id of the n-th option (results or recent terms – only one list is visible). */
export const searchOptionId = (index: number) => `search-option-${index}`;

export const isSearchItemActionable = (item: ISearchItem) =>
  Boolean(SearchManager.getHandler(item.emit) || item.route?.path);

const sortGroups = (groups: ISearchGroup[]) =>
  [...groups].sort(
    (a, b) =>
      (SearchManager.getGroup(a.name)?.sortOrder ?? 50) -
      (SearchManager.getGroup(b.name)?.sortOrder ?? 50)
  );

export interface IUseSearchPanelOptions {
  focus: boolean;
  onSelectItem?: (item: ISearchItem) => boolean | void;
}

/** State + keyboard handling of the search panel (input, filters, results, recent terms). */
export const useSearchPanel = ({ focus, onSelectItem }: IUseSearchPanelOptions) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  // Term lives in the store → kept when the dialog closes and reopens.
  const term = useSearchUi(state => state.term);
  const setTerm = useSearchUi(state => state.setTerm);
  const config = useSearchConfig(true);
  const search = useSearch(term, config.selected);
  const recent = useRecentSearches();

  const groups = useMemo(() => sortGroups(search.result?.groups ?? []), [search.result]);
  const flat = useMemo(() => groups.flatMap(group => group.items), [groups]);
  /** Index of the first item of each group in `flat`. */
  const offsets = useMemo(
    () =>
      groups.reduce<number[]>(
        (acc, _group, i) => [...acc, i === 0 ? 0 : acc[i - 1] + groups[i - 1].items.length],
        []
      ),
    [groups]
  );

  // Results: first hit is pre-selected (Enter opens it). Recent terms: nothing until ↑/↓.
  const showsRecent = !search.active && !term.trim();
  const resetKey: unknown = showsRecent ? recent.items : search.result;
  const [activeIndex, setActiveIndex] = useState(showsRecent ? -1 : 0);
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setActiveIndex(showsRecent ? -1 : 0);
  }
  const count = showsRecent ? recent.items.length : search.active ? flat.length : 0;

  const focusInput = () => inputRef.current?.focus();

  const clear = () => {
    setTerm('');
    focusInput();
  };

  const pickRecent = (value: string) => {
    setTerm(value);
    focusInput();
  };

  const select = (item: ISearchItem) => {
    if (onSelectItem?.(item)) {
      recent.add(term);
      return;
    }
    if (!isSearchItemActionable(item)) return;
    recent.add(term);
    // Handlers open drawers on top of the search – it stays open underneath (back returns here).
    window.setTimeout(
      () => executeSearchItem(item, { router, closeSearch: SearchManager.close }),
      60
    );
  };

  // Kept term: select it, so typing replaces it and Enter/arrows still work.
  useEffect(() => {
    if (!focus) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [focus]);

  // Keep the active row visible.
  useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current
      ?.querySelector(`#${searchOptionId(activeIndex)}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!count) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % count);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i <= 0 ? count - 1 : i - 1));
    } else if (e.key === 'Enter' && !e.nativeEvent.isComposing && activeIndex >= 0) {
      e.preventDefault();
      if (showsRecent) pickRecent(recent.items[activeIndex]);
      else if (flat[activeIndex]) select(flat[activeIndex]);
    }
  };

  return {
    inputRef,
    listRef,
    term,
    setTerm,
    clear,
    config,
    search,
    recent,
    groups,
    offsets,
    activeIndex,
    setActiveIndex,
    activeDescendant: count && activeIndex >= 0 ? searchOptionId(activeIndex) : undefined,
    select,
    pickRecent,
    onKeyDown,
  };
};

export type SearchPanelState = ReturnType<typeof useSearchPanel>;
