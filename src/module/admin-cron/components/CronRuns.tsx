import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ICronRun } from '../types';
import { dateTime, formatMs } from '../utils';

/** Manual runs of one job (since the last server restart), newest first. */
export const CronRuns: React.FC<{ runs: ICronRun[] | null; loading: boolean }> = ({
  runs,
  loading,
}) => {
  const { t } = useTranslation('admin-cron');

  if (loading) return <Skeleton className="h-16 rounded-xl" />;
  if (!runs?.length) return <p className="text-caption text-muted-foreground">{t('runs.empty')}</p>;

  return (
    <ul className="flex flex-col divide-y divide-border/50">
      {runs.slice(0, 10).map(run => (
        <li key={run.at} className="flex items-center justify-between gap-2 py-2 text-caption">
          <span className="tabular-nums">{dateTime(run.at)}</span>
          <span className={run.success ? 'text-muted-foreground' : 'truncate text-destructive'}>
            {run.success ? t('runs.ok') : (run.error ?? t('runs.failed'))}
          </span>
          <span className="tabular-nums text-muted-foreground">{formatMs(run.durationMs)}</span>
        </li>
      ))}
    </ul>
  );
};
