import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { CronFilter } from '../types';

const FILTERS: CronFilter[] = ['all', 'active', 'inactive'];

/** Sticky search + filter chips. */
export const CronToolbar: React.FC<{
  query: string;
  filter: CronFilter;
  onQuery: (value: string) => void;
  onFilter: (value: CronFilter) => void;
}> = ({ query, filter, onQuery, onFilter }) => {
  const { t } = useTranslation('admin-cron');
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-border/50 bg-background/80 p-4 backdrop-blur">
      <Input
        type="search"
        value={query}
        onChange={event => onQuery(event.target.value)}
        placeholder={t('search')}
        aria-label={t('search')}
      />
      <div className="flex gap-2">
        {FILTERS.map(value => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? 'default' : 'outline'}
            aria-pressed={filter === value}
            onClick={() => onFilter(value)}
          >
            {t(`filter.${value}`)}
          </Button>
        ))}
      </div>
    </div>
  );
};
