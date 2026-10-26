import { cn } from '@ui/lib/utils';
import { BarList, ChartSection } from '@ui/patterns/chart';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Progress } from '@ui/shad-cn/components/progress.tsx';
import { Check, HardDrive, Loader2, RefreshCw, TriangleAlert } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatAgo } from '../../stats/utils';
import { SystemApi } from '../api';
import type { ISystemStorage } from '../types';
import { formatBytes, GB, MB } from '../utils';

/** Tab "Speicher": disk usage, what takes up space, hints (runtime `system-storage-cron-job`). */
export const SystemStorageTab: React.FC = () => {
  const [fresh, setFresh] = useState(0);
  const { data, loading, error, reload } = useStatsQuery(
    () => SystemApi.storage(fresh > 0),
    result => result.storage,
    `storage|${fresh}`
  );
  const refreshing = fresh > 0 && loading;
  if (loading && !data) return <StatsSkeleton tiles={1} variant="list" />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  return <Storage storage={data} refreshing={refreshing} onRefresh={() => setFresh(n => n + 1)} />;
};

const Storage: React.FC<{
  storage: ISystemStorage;
  refreshing: boolean;
  onRefresh: () => void;
}> = ({ storage, refreshing, onRefresh }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const size = (bytes: number) => formatBytes(bytes, locale);
  const { disk, parts } = storage;
  const warn = disk.percent >= storage.warnPercent;
  const share = (bytes: number) =>
    disk.total ? `${size(bytes)} · ${Math.round((bytes / disk.total) * 100)} %` : size(bytes);

  const known = parts.uploads + parts.backups + parts.logs + (parts.binlogs ?? 0);
  const other = Math.max(0, disk.used - known);
  const items = [
    {
      key: 'uploads',
      label: (
        <>
          {t('system.storage.uploads')}
          {parts.kidsUploads > 0 && (
            <span className="block text-caption font-normal text-muted-foreground">
              {t('system.storage.kidsUploads')} {size(parts.kidsUploads)}
            </span>
          )}
        </>
      ),
      value: parts.uploads,
      display: share(parts.uploads),
    },
    {
      key: 'backups',
      label: t('system.storage.backups'),
      value: parts.backups,
      display: share(parts.backups),
    },
    { key: 'logs', label: t('system.storage.logs'), value: parts.logs, display: share(parts.logs) },
    {
      key: 'binlogs',
      label: t('system.storage.binlogs'),
      value: parts.binlogs ?? 0,
      display: parts.binlogs === null ? t('system.storage.binlogsOff') : share(parts.binlogs),
    },
    { key: 'other', label: t('system.storage.other'), value: other, display: share(other) },
  ].sort((a, b) => b.value - a.value);

  const hints = [
    parts.binlogs !== null && parts.binlogs > GB
      ? t('system.storage.hints.binlogs', { expire: storage.binlogExpire })
      : null,
    parts.backups > 5 * GB ? t('system.storage.hints.backups') : null,
    parts.logs > 500 * MB ? t('system.storage.hints.logs') : null,
  ].filter((hint): hint is string => Boolean(hint));

  return (
    <>
      <section className="border-b border-border/50 px-4 py-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={cn(
              'grid size-12 shrink-0 place-items-center rounded-full [&>svg]:size-6',
              warn ? 'border-2 border-foreground text-foreground' : 'bg-foreground text-background'
            )}
          >
            {warn ? <TriangleAlert /> : <HardDrive />}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-title font-bold">{t('system.storage.title')}</h3>
            <p className="text-caption text-muted-foreground">
              {t('system.storage.measured', { ago: formatAgo(storage.measuredAt, locale) })}
            </p>
          </div>
        </div>

        <p className="mt-4 flex items-baseline justify-between gap-3">
          <span className="text-2xl font-extrabold tabular-nums">
            {t('system.storage.used', { percent: disk.percent })}
          </span>
          <span className="text-caption text-muted-foreground tabular-nums">
            {t('system.storage.free', { free: size(disk.free), total: size(disk.total) })}
          </span>
        </p>
        <Progress
          value={disk.percent}
          aria-label={t('system.storage.used', { percent: disk.percent })}
          className="mt-2 h-3 bg-foreground/10 [&>div]:bg-foreground"
        />
        <p className={cn('mt-2 text-caption', warn ? 'font-semibold' : 'text-muted-foreground')}>
          {warn
            ? t('system.storage.warnActive')
            : t('system.storage.warn', { percent: storage.warnPercent })}
        </p>

        <Button
          variant="outline"
          className="mt-4 h-11 w-full rounded-full font-bold"
          onClick={onRefresh}
          disabled={refreshing}
          aria-busy={refreshing}
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          {refreshing ? t('system.storage.refreshing') : t('system.storage.refresh')}
        </Button>
      </section>

      <ChartSection title={t('system.storage.parts')} text={t('system.storage.partsText')}>
        <BarList items={items} max={disk.total} className="mt-3" />
      </ChartSection>

      <ChartSection title={t('system.storage.hints.title')} plain>
        <ul className="mt-2 flex flex-col gap-2">
          {(hints.length ? hints : [t('system.storage.hints.ok')]).map(hint => (
            <li key={hint} className="flex items-start gap-2 text-body">
              <span
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-muted-foreground [&>svg]:size-4"
              >
                {hints.length ? <TriangleAlert /> : <Check />}
              </span>
              <span className="min-w-0">{hint}</span>
            </li>
          ))}
        </ul>
      </ChartSection>
    </>
  );
};
