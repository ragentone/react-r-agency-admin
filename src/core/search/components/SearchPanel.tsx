import type React from 'react';

import type { ISearchItem } from '../types';
import { SearchFilters } from './SearchFilters';
import { SearchFooter } from './SearchFooter';
import { SearchInput } from './SearchInput';
import { SearchRecent } from './SearchRecent';
import { SearchResults } from './SearchResults';
import { SearchEmpty, SearchError, SearchIdle, SearchSkeleton } from './SearchStates';
import { type SearchPanelState, useSearchPanel } from './use-search-panel';

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

type SearchBodyState = Omit<SearchPanelState, 'inputRef' | 'listRef'>;

/** Content below the filters: recent terms, loading, error, empty or results. */
const SearchBody: React.FC<{ panel: SearchBodyState }> = ({ panel }) => {
  const { search, recent, config, term } = panel;

  if (!search.active) {
    return recent.items.length > 0 && !term.trim() ? (
      <SearchRecent
        items={recent.items}
        activeIndex={panel.activeIndex}
        onPick={panel.pickRecent}
        onRemove={recent.remove}
        onClear={recent.clear}
        onHover={panel.setActiveIndex}
      />
    ) : (
      <SearchIdle typing={term.trim().length > 0} />
    );
  }
  if (search.error) return <SearchError onRetry={search.retry} />;
  if (!search.result) return <SearchSkeleton />;
  if (search.result.isEmpty && !search.stale) {
    return (
      <SearchEmpty
        term={term.trim()}
        onWiden={config.allSelected ? undefined : config.selectAll}
        onClear={panel.clear}
      />
    );
  }
  return (
    <SearchResults
      groups={panel.groups}
      offsets={panel.offsets}
      term={term}
      activeIndex={panel.activeIndex}
      stale={search.stale}
      onHover={panel.setActiveIndex}
      onSelect={panel.select}
    />
  );
};

/** Search UI (input, area filter, results, keyboard) – container agnostic. */
export const SearchPanel: React.FC<ISearchPanelProps> = ({
  onClose,
  focus = true,
  onSelectItem,
}) => {
  const { inputRef, listRef, ...panel } = useSearchPanel({ focus, onSelectItem });
  const { config, search } = panel;

  return (
    <div
      data-slot="search-panel"
      onKeyDown={panel.onKeyDown}
      className="flex h-full min-h-0 flex-col overflow-hidden pt-2"
    >
      <SearchInput
        inputRef={inputRef}
        value={panel.term}
        onChange={panel.setTerm}
        onClear={panel.clear}
        onClose={onClose}
        loading={search.loading}
        activeDescendant={panel.activeDescendant}
      />
      <SearchFilters
        bundles={config.bundles}
        selected={config.selected}
        allSelected={config.allSelected}
        onToggle={config.toggle}
        onSelectAll={config.selectAll}
      />
      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <SearchBody panel={panel} />
      </div>
      <SearchFooter result={search.result} />
    </div>
  );
};
