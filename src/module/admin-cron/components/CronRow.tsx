import { TableCell, TableRow } from '@ui/shad-cn/components/table.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ICronJob } from '../types';
import { dateTime, formatMs } from '../utils';
import { CronStatus } from './CronStatus';

/** One job as a clickable table row. */
export const CronRow: React.FC<{ job: ICronJob; onOpen: (job: ICronJob) => void }> = ({
  job,
  onOpen,
}) => {
  const { t } = useTranslation('admin-cron');
  const last = job.lastRun;
  return (
    <TableRow className="cursor-pointer border-border/50" onClick={() => onOpen(job)}>
      <TableCell className="max-w-48 truncate font-bold">{job.name}</TableCell>
      <TableCell className="font-mono text-caption text-muted-foreground">
        {job.expression}
      </TableCell>
      <TableCell>
        <CronStatus job={job} />
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {job.nextRun ? dateTime(job.nextRun) : t('noNextShort')}
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {last ? `${dateTime(last.at)} · ${formatMs(last.durationMs)}` : '–'}
      </TableCell>
    </TableRow>
  );
};
