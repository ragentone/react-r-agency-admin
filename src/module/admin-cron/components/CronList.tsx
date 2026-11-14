import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ICronJob } from '../types';
import { CronEmpty } from './CronEmpty';
import { CronRow } from './CronRow';

/** Jobs as a table: name, schedule, status, next run, last run. */
export const CronList: React.FC<{
  jobs: ICronJob[];
  filtered: boolean;
  onOpen: (job: ICronJob) => void;
}> = ({ jobs, filtered, onOpen }) => {
  const { t } = useTranslation('admin-cron');
  if (jobs.length === 0) return <CronEmpty filtered={filtered} />;
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/50">
          <TableHead>{t('table.name')}</TableHead>
          <TableHead>{t('table.expression')}</TableHead>
          <TableHead>{t('table.status')}</TableHead>
          <TableHead>{t('table.next')}</TableHead>
          <TableHead>{t('table.last')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map(job => (
          <CronRow key={job.name} job={job} onOpen={onOpen} />
        ))}
      </TableBody>
    </Table>
  );
};
