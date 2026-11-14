import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Status, StatusIndicator } from '@ui/shad-cn/components/status.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorCron } from '../../types.app';
import { clockShort } from '../../utils';

/** Scheduled jobs as a table: name, cron expression, status, next run. */
export const MonitorCron: React.FC<{ cron: IMonitorCron[] }> = ({ cron }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-title font-bold">{t('cron.title')}</h3>
          <p className="text-caption text-muted-foreground">{t('cron.text')}</p>
        </div>
        {cron.length === 0 ? (
          <p className="text-body text-muted-foreground">{t('cron.empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>{t('cron.table.name')}</TableHead>
                <TableHead>{t('cron.table.expression')}</TableHead>
                <TableHead>{t('cron.table.status')}</TableHead>
                <TableHead>{t('cron.table.next')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cron.map(job => (
                <TableRow key={job.name} className="border-border/50">
                  <TableCell className="max-w-48 truncate font-bold">{job.name}</TableCell>
                  <TableCell className="font-mono text-caption text-muted-foreground">
                    {job.expression}
                  </TableCell>
                  <TableCell>
                    <Status
                      variant={job.active && job.status === 'running' ? 'info' : 'default'}
                    >
                      <StatusIndicator />
                      {t(job.active ? `cron.status.${job.status}` : 'cron.inactive')}
                    </Status>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {job.nextRun ? clockShort(job.nextRun) : '–'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
