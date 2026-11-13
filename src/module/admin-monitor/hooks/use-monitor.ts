import { useStatsQuery } from '../../admin/stats/hooks/use.stats.query';
import { AdminMonitorApi } from '../api';
import { ADMIN_MONITOR_POLL_MS } from '../const';

/** Snapshot of the server, reloaded every few seconds while the tab is visible. */
export const useMonitor = (minutes: number) =>
  useStatsQuery(
    () => AdminMonitorApi.snapshot(minutes),
    result => result.snapshot,
    `monitor-${minutes}`,
    ADMIN_MONITOR_POLL_MS
  );
