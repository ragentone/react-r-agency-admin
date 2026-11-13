import { AppDrawer } from '@ui/patterns/drawer';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Play } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useCronRuns } from '../hooks/use-cron';
import { useCronRun } from '../hooks/use-cron-run';
import type { ICronJob } from '../types';
import { dateTime } from '../utils';
import { CronRuns } from './CronRuns';
import { CronStatus } from './CronStatus';

/** Details of a job, its manual runs and "Run now" (asks to confirm the identity first). */
export const CronDrawer: React.FC<{
  job: ICronJob | null;
  onClose: () => void;
  onChanged: () => void;
}> = ({ job, onClose, onChanged }) => {
  const { t } = useTranslation('admin-cron');
  const runs = useCronRuns(job?.name ?? '');
  const { run, busy } = useCronRun(() => {
    runs.reload();
    onChanged();
  });
  const canRun = Boolean(job?.active) && job?.status !== 'running';

  return (
    <AppDrawer
      open={job !== null}
      onOpenChange={open => !open && onClose()}
      title={job?.name ?? ''}
      description={t('drawer.description')}
      size="auto"
      locked={busy}
      footer={
        <Button
          size="xl"
          fullWidth
          isLoading={busy}
          disabled={!canRun || busy}
          onClick={() => job && void run(job.name)}
        >
          <Play className="size-4" aria-hidden />
          {t('run.action')}
        </Button>
      }
    >
      {job && (
        <div className="flex flex-col gap-4 p-4">
          <dl className="flex flex-col gap-3 text-body">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-caption text-muted-foreground">{t('drawer.status')}</dt>
              <dd>
                <CronStatus job={job} />
              </dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">{t('drawer.expression')}</dt>
              <dd className="font-mono text-caption">{job.expression}</dd>
            </div>
            <div>
              <dt className="text-caption text-muted-foreground">{t('drawer.next')}</dt>
              <dd className="tabular-nums">{job.nextRun ? dateTime(job.nextRun) : '–'}</dd>
            </div>
          </dl>
          {!canRun && (
            <p className="text-caption text-muted-foreground">
              {t(job.active ? 'drawer.runningHint' : 'drawer.inactiveHint')}
            </p>
          )}
          <section className="flex flex-col gap-2">
            <h3 className="text-title font-bold">{t('runs.title')}</h3>
            <CronRuns runs={runs.data} loading={runs.loading} />
          </section>
        </div>
      )}
    </AppDrawer>
  );
};
