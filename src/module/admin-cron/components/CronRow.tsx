import { cn } from '@ui/lib/utils';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ICronJob } from '../types';
import { dateTime } from '../utils';
import { CronStatus } from './CronStatus';

/** One job as a tappable row: name, expression, status, next run. */
export const CronRow: React.FC<{ job: ICronJob; onOpen: (job: ICronJob) => void }> = ({
  job,
  onOpen,
}) => {
  const { t } = useTranslation('admin-cron');
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(job)}
        className={cn(
          'flex min-h-14 w-full items-center gap-3 border-b border-border/50 px-4 py-3 text-left',
          'transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring'
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-bold">{job.name}</p>
          <p className="truncate font-mono text-caption text-muted-foreground">{job.expression}</p>
          <p className="truncate text-caption text-muted-foreground">
            {job.nextRun ? t('next', { time: dateTime(job.nextRun) }) : t('noNext')}
          </p>
        </div>
        <CronStatus job={job} />
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>
    </li>
  );
};
