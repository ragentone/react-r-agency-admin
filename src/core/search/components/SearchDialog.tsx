import { useRouter } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { History, Loader2, Search, SearchX, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SEARCH_MIN_LENGTH } from '../const';
import { useSearch } from '../hooks/use.search';
import { useSearchConfig } from '../hooks/use.search.config';
import { useRecentSearches } from '../hooks/use.search.recent';
import { executeSearchItem, SearchManager } from '../manager';
import { useSearchUi } from '../store';
import type { ISearchItem } from '../types';
import { SearchResultItem } from './SearchResultItem';
import { Button } from '@ui/shad-cn/components/button.tsx';

/** Translated label: `ns:key` / known bundle alias / plain text. */
const useLabel = () => {
  const { t } = useTranslation('search');
  return (value: string, fallbackKey?: string) =>
    String(
      t(fallbackKey ?? value, {
        defaultValue: t(value, { defaultValue: value }),
      })
    );
};

export interface ISearchPanelProps {
  onClose: () => void;
  /** Focus (+ select) the input – e.g. once the drawer finished opening. */
  focus?: boolean;
  /**
   * Custom handling of a selected hit (return `true` = handled, nothing else happens).
   * E.g. a drawer that opens profiles nested instead of globally.
   */
  onSelectItem?: (item: ISearchItem) => boolean | void;
}

/** Search UI (input, bundle filter, results, keyboard) – container agnostic. */
export const SearchPanel: React.FC<ISearchPanelProps> = ({
  onClose,
  focus = true,
  onSelectItem,
}) => {
  const { t } = useTranslation('search');
  const label = useLabel();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  // Term lives in the store → kept when the dialog closes and reopens.
  const term = useSearchUi(state => state.term);
  const setTerm = useSearchUi(state => state.setTerm);
  const [activeIndex, setActiveIndex] = useState(0);
  const config = useSearchConfig(true);
  const search = useSearch(term, config.selected);
  const recent = useRecentSearches();

  // Groups in registered order, flat list for keyboard navigation.
  const groups = useMemo(
    () =>
      [...(search.result?.groups ?? [])].sort(
        (a, b) =>
          (SearchManager.getGroup(a.name)?.sortOrder ?? 50) -
          (SearchManager.getGroup(b.name)?.sortOrder ?? 50)
      ),
    [search.result]
  );
  const flat = useMemo(() => groups.flatMap(group => group.items), [groups]);
  // Index of the first item of each group in `flat`.
  const offsets = useMemo(
    () =>
      groups.reduce<number[]>(
        (acc, _group, i) => [...acc, i === 0 ? 0 : acc[i - 1] + groups[i - 1].items.length],
        []
      ),
    [groups]
  );
  const [lastResult, setLastResult] = useState(search.result);
  if (lastResult !== search.result) {
    setLastResult(search.result);
    setActiveIndex(0);
  }

  const actionable = (item: ISearchItem) =>
    Boolean(SearchManager.getHandler(item.emit) || item.route?.path);

  const select = (item: ISearchItem) => {
    if (onSelectItem?.(item)) {
      recent.add(term);
      return;
    }
    if (!actionable(item)) return;
    recent.add(term);
    //onClose();
    // Let the dialog close (back-button history) before navigating.
    window.setTimeout(() => executeSearchItem(item, { router }), 60);
  };

  // Kept term: select it, so typing replaces it and Enter/arrows still work.
  useEffect(() => {
    if (!focus) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [focus]);

  // Keep the active row visible.
  useEffect(() => {
    listRef.current
      ?.querySelector(`#search-item-${activeIndex}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!flat.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % flat.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + flat.length) % flat.length);
    } else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      const item = flat[activeIndex];
      if (item) select(item);
    }
  };

  return (
    <div
      data-slot="search-panel"
      onKeyDown={onKeyDown}
      className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent outline-none"
    >
      {/* Input row */}
      <div className="flex items-center gap-2 border-b border-border/50 px-3 pb-2">
        <label className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full px-2">
          {search.loading ? (
            <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="size-5 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            aria-controls="search-results"
            aria-activedescendant={flat.length ? `search-item-${activeIndex}` : undefined}
            className="min-w-0 flex-1 bg-transparent text-title outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
          />
          {term && (
            <button
              type="button"
              onClick={() => {
                setTerm('');
                inputRef.current?.focus();
              }}
              aria-label={t('clear')}
              className="grid size-6 shrink-0 place-items-center rounded-full bg-foreground/10 text-foreground hover:bg-foreground/20"
            >
              <X className="size-3.5" strokeWidth={2.5} />
            </button>
          )}
        </label>
        <button
          type="button"
          onClick={onClose}
          className="h-9 shrink-0 rounded-full px-3 text-body font-semibold text-foreground hover:bg-foreground/[0.06] sm:hidden"
        >
          {t('cancel')}
        </button>
        <Button variant={'link'} onClick={onClose} size={'sm'}>
          <X />
        </Button>
      </div>

      {/* Bundle filter */}
      {config.bundles.length > 1 && (
        <div
          role="group"
          aria-label={t('bundles')}
          className="flex gap-1.5 overflow-x-auto border-b border-border/50 px-4 py-2.5 [scrollbar-width:none]"
        >
          {config.bundles.map(bundle => {
            const on = config.selected.includes(bundle.alias);
            return (
              <button
                key={bundle.alias}
                type="button"
                aria-pressed={on}
                onClick={() => config.toggle(bundle.alias)}
                className={cn(
                  'h-8 shrink-0 rounded-full px-3.5 text-caption font-semibold whitespace-nowrap transition-colors',
                  on
                    ? 'bg-foreground text-background'
                    : 'bg-foreground/[0.05] text-muted-foreground hover:text-foreground'
                )}
              >
                {label(bundle.label, `bundleLabels.${bundle.alias}`)}
              </button>
            );
          })}
        </div>
      )}

      {/* Body */}
      <div
        ref={listRef}
        id="search-results"
        role="listbox"
        aria-label={t('results')}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {!search.active ? (
          recent.items.length > 0 ? (
            <section className="p-1">
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <h3 className="text-micro font-semibold tracking-wider text-muted-foreground uppercase">
                  {t('recent')}
                </h3>
                <button
                  type="button"
                  onClick={recent.clear}
                  className="text-caption font-semibold text-muted-foreground hover:text-foreground"
                >
                  {t('clearRecent')}
                </button>
              </div>
              <ul>
                {recent.items.map(item => (
                  <li
                    key={item}
                    className="group flex items-center rounded-2xl hover:bg-foreground/[0.04]"
                  >
                    <button
                      type="button"
                      onClick={() => setTerm(item)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left"
                    >
                      <History className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-body">{item}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => recent.remove(item)}
                      aria-label={t('removeRecent', { term: item })}
                      className="mr-2 grid size-7 place-items-center rounded-full text-muted-foreground opacity-60 hover:bg-foreground/10 hover:text-foreground hover:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <p className="px-4 py-12 text-center text-body text-muted-foreground">
              {t('hint', { count: SEARCH_MIN_LENGTH })}
            </p>
          )
        ) : search.error ? (
          <p role="alert" className="px-4 py-12 text-center text-body text-muted-foreground">
            {t('error')}
          </p>
        ) : !search.result && search.loading ? (
          <ul aria-hidden className="space-y-1 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton
                    className="h-3.5 rounded-full"
                    style={{ width: `${45 + ((i * 13) % 35)}%` }}
                  />
                  <Skeleton className="h-3 w-1/3 rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : search.result?.isEmpty ? (
          <div className="flex flex-col items-center px-8 py-12 text-center">
            <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-foreground/[0.05]">
              <SearchX className="size-6" strokeWidth={1.75} />
            </span>
            <p className="text-title font-bold">{t('emptyTitle', { term: term.trim() })}</p>
            <p className="mt-1 max-w-xs text-body text-muted-foreground">{t('emptyText')}</p>
          </div>
        ) : (
          <div className={cn('transition-opacity', search.stale && 'opacity-50')}>
            {groups.map((group, groupIndex) => {
              const groupConfig = SearchManager.getGroup(group.name);
              const GroupIcon = groupConfig?.icon;
              return (
                <section key={group.name} className="mb-2 last:mb-0">
                  <h3 className="flex items-center gap-1.5 px-3 pt-2 pb-1 text-micro font-semibold tracking-wider text-muted-foreground uppercase">
                    {GroupIcon && <GroupIcon className="size-3.5" />}
                    {label(
                      groupConfig?.label ?? group.label,
                      groupConfig ? undefined : `groups.${group.name}`
                    )}
                    <span className="ml-auto tabular-nums">{group.items.length}</span>
                  </h3>
                  <ul>
                    {group.items.map((item, itemIndex) => {
                      const i = offsets[groupIndex] + itemIndex;
                      return (
                        <SearchResultItem
                          key={item.id ?? `${group.name}-${i}`}
                          id={`search-item-${i}`}
                          item={item}
                          term={term}
                          active={i === activeIndex}
                          actionable={actionable(item)}
                          onHover={() => setActiveIndex(i)}
                          onSelect={() => select(item)}
                        />
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer (desktop): shortcuts + stats */}
      <div className="hidden items-center justify-between border-t border-border/50 px-4 py-2 text-micro text-muted-foreground sm:flex">
        <span className="flex items-center gap-3">
          <span>
            <kbd className="font-sans font-semibold">↑↓</kbd> {t('keys.navigate')}
          </span>
          <span>
            <kbd className="font-sans font-semibold">↵</kbd> {t('keys.open')}
          </span>
        </span>
        {search.result && !search.result.isEmpty && (
          <span className="tabular-nums">
            {t('stats', {
              count: search.result.total,
              ms: Math.round(Number(search.result.hrtime)),
            })}
          </span>
        )}
      </div>
    </div>
  );
};

/** Fallback if the open animation never reports completion (e.g. reduced motion). */
const OPEN_FALLBACK_MS = 600;

export interface ISearchDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectItem?: ISearchPanelProps['onSelectItem'];
}

/**
 * Search as bottom drawer. Render it inside another drawer to stack it on top
 * (base-ui nested drawers), e.g. in the friends drawer.
 */
export const SearchDrawer: React.FC<ISearchDrawerProps> = ({ open, onClose, onSelectItem }) => {
  const { t } = useTranslation('search');
  const [opened, setOpened] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setOpened(false);
  }
  useEffect(() => {
    if (!open || opened) return;
    const timer = window.setTimeout(() => setOpened(true), OPEN_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [open, opened]);

  return (
    <Drawer
      open={open}
      onOpenChange={next => !next && onClose()}
      onOpenChangeComplete={next => next && setOpened(true)}
      showSwipeHandle
    >
      <DrawerContent className="mx-auto w-full max-w-[640px] [--drawer-height:88dvh] sm:[--drawer-height:75dvh]">
        <DrawerTitle className="sr-only">{t('title')}</DrawerTitle>
        <DrawerDescription className="sr-only">{t('placeholder')}</DrawerDescription>
        {open && <SearchPanel onClose={onClose} focus={opened} onSelectItem={onSelectItem} />}
      </DrawerContent>
    </Drawer>
  );
};

/** Global search drawer. Open with ⌘K / Ctrl+K, "/" or `SearchManager.open()`. */
export const SearchDialog: React.FC = () => {
  const open = useSearchUi(state => state.open);
  const setOpen = useSearchUi(state => state.setOpen);
  return <SearchDrawer open={open} onClose={() => setOpen(false)} />;
};
