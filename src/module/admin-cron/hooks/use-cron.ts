import { useStatsQuery } from '../../admin/stats/hooks/use.stats.query';
import { AdminCronApi } from '../api';
import { ADMIN_CRON_POLL_MS } from '../const';

/** All jobs with state and next run, reloaded every few seconds while the page is visible. */
export const useCronJobs = () =>
  useStatsQuery(
    () => AdminCronApi.list(),
    result => result.list,
    'cron-list',
    ADMIN_CRON_POLL_MS
  );

/** Manual runs of one job (loaded while its drawer is open). */
export const useCronRuns = (name: string) =>
  useStatsQuery(
    () => AdminCronApi.runs(name),
    result => result.list,
    `cron-runs-${name}`
  );
