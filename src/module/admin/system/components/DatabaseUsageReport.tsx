import { Button } from '@ui/shad-cn/components/button.tsx';
import { Loader2, RefreshCw } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { formatAgo } from '../../stats/utils';
import type { DbUsageStatus, IDbUsageReport } from '../types';
import { DatabaseMissingList } from './DatabaseMissingList';
import { DatabaseTableList } from './DatabaseTableList';

type Filter = 'candidates' | 'storage' | 'in-use' | 'all';

const FILTERS: Filter[] = ['candidates', 'storage', 'in-use', 'all'];

const MATCH: Record<Filter, DbUsageStatus[]> = {
  candidates: ['unknown', 'plugin-orphan'],
  storage: ['storage'],
  'in-use': ['in-use'],
  all: ['unknown', 'plugin-orphan', 'storage', 'in-use'],
};

interface Props {
  report: IDbUsageReport;
  refreshing: boolean;
  onRefresh: () => void;
}

/** Summary, filter and list of the table usage check. */
export const DatabaseUsageReport: React.FC<Props> = ({ report, refreshing, onRefresh }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const [filter, setFilter] = useState<Filter>('candidates');
  const tables = useMemo(
    () => report.tables.filter(table => MATCH[filter].includes(table.status)),
    [report.tables, filter]
  );
  const { summary } = report;

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-title font-bold">{t('system.database.title')}</h3>
          <p className="text-caption text-muted-foreground">
            {t('system.database.meta', {
              name: report.database,
              ago: formatAgo(report.generatedAt, locale),
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          aria-busy={refreshing}
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {refreshing ? t('system.database.refreshing') : t('system.database.refresh')}
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Tile
          label={t('system.database.summary.candidates')}
          value={summary.unknown + summary.pluginOrphan}
        />
        <Tile label={t('system.database.summary.storage')} value={summary.storage} />
        <Tile label={t('system.database.summary.inUse')} value={summary.inUse} />
        <Tile label={t('system.database.summary.missing')} value={summary.missing} />
      </dl>

      <p className="text-caption text-muted-foreground">{t('system.database.hint')}</p>

      <div
        role="group"
        aria-label={t('system.database.filterLabel')}
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map(item => (
          <Button
            key={item}
            variant={filter === item ? 'default' : 'outline'}
            size="sm"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {t(`system.database.filter.${item}`)}
          </Button>
        ))}
      </div>

      <DatabaseTableList tables={tables} />
      <DatabaseMissingList missing={report.missing} />
    </div>
  );
};

const Tile: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="rounded-xl border border-border p-3">
    <dt className="text-caption text-muted-foreground">{label}</dt>
    <dd className="text-2xl font-extrabold tabular-nums">{value}</dd>
  </div>
);
