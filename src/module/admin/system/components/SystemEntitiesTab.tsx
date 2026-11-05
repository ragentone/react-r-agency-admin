import { Input } from '@ui/shad-cn/components/input.tsx';
import { Search } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { SystemApi } from '../api';
import { readLast, rememberLast } from '../last.loaded';
import type { IDbEntity } from '../types';
import { EntityList } from './EntityList';

const ENTITIES_KEY = 'db-entities';

/** Entities view: every registered entity with its table, columns and row count. */
export const SystemEntitiesTab: React.FC = () => {
  const { data, loading, error, reload } = useStatsQuery(
    () => SystemApi.dbEntities(),
    result => result.entities,
    ENTITIES_KEY
  );
  useEffect(() => {
    if (data) rememberLast(ENTITIES_KEY, data);
  }, [data]);
  const shown = data ?? readLast<IDbEntity[]>(ENTITIES_KEY);
  if (!shown && loading) return <StatsSkeleton tiles={0} variant="list" />;
  if (!shown && error) return <StatsError onRetry={() => void reload()} />;
  if (!shown) return null;
  return <EntitiesView entities={shown} />;
};

const EntitiesView: React.FC<{ entities: IDbEntity[] }> = ({ entities }) => {
  const { t } = useTranslation('admin');
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entities;
    return entities.filter(
      entity =>
        entity.entity.toLowerCase().includes(needle) || entity.table.toLowerCase().includes(needle)
    );
  }, [entities, query]);

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div>
        <h3 className="text-title font-bold">{t('system.entities.title')}</h3>
        <p className="text-caption text-muted-foreground">
          {t('system.entities.count', { count: entities.length })}
        </p>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={t('system.entities.search')}
          aria-label={t('system.entities.search')}
          className="h-11 pl-9 text-body"
        />
      </div>
      <EntityList entities={shown} />
    </div>
  );
};
