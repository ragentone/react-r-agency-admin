import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface IAdminDocSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  count: number;
  index: number;
  onPrev: () => void;
  onNext: () => void;
}

/** Drawer sub-header: search field, „2/5“ counter, previous / next hit. Enter = next, Shift+Enter = previous. */
export const AdminDocSearch: React.FC<IAdminDocSearchProps> = ({
  query,
  onQueryChange,
  count,
  index,
  onPrev,
  onNext,
}) => {
  const { t } = useTranslation('admin');
  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          onKeyDown={event => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            if (event.shiftKey) onPrev();
            else onNext();
          }}
          placeholder={t('docs.search.placeholder')}
          aria-label={t('docs.search.label')}
          className="h-10 pl-9 text-base"
        />
      </div>
      <span className="shrink-0 px-1 text-caption tabular-nums text-muted-foreground">
        {hasQuery ? (count ? `${index + 1}/${count}` : t('docs.search.none')) : ''}
      </span>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={onPrev}
        disabled={count < 2}
        aria-label={t('docs.search.prev')}
        title={t('docs.search.prev')}
      >
        <ChevronUp className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        onClick={onNext}
        disabled={count < 2}
        aria-label={t('docs.search.next')}
        title={t('docs.search.next')}
      >
        <ChevronDown className="size-5" />
      </Button>
    </div>
  );
};
