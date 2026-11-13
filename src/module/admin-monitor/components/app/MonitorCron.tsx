import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Status, StatusIndicator } from '@ui/shad-cn/components/status.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorCron } from '../../types.app';
import { clockShort } from '../../utils';

/** Scheduled jobs: name, cron expression, running / pending, next run. */
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
          <ul className="flex flex-col divide-y divide-border/50">
            {cron.map(job => (
              <li
                key={job.name}
                className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-body font-bold">{job.name}</p>
                  <p className="truncate font-mono text-caption text-muted-foreground">
                    {job.expression}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!job.active && (
                    <Status variant="default">
                      <StatusIndicator />
                      {t('cron.inactive')}
                    </Status>
                  )}
                  <Status variant={job.status === 'running' ? 'info' : 'default'}>
                    <StatusIndicator />
                    {t(`cron.status.${job.status}`)}
                  </Status>
                  <span className="text-caption text-muted-foreground">
                    {job.nextRun ? clockShort(job.nextRun) : '–'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
