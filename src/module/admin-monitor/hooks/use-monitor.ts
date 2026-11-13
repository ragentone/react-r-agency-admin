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

/** Application metrics (WebSocket, GraphQL, cron, plugins, database, mesh). */
export const useMonitorApp = () =>
  useStatsQuery(
    () => AdminMonitorApi.app(),
    result => result.app,
    'monitor-app',
    10_000
  );

/** Open alerts, log and thresholds. */
export const useMonitorAlerts = () =>
  useStatsQuery(
    () => AdminMonitorApi.alerts(),
    result => result.alerts,
    'monitor-alerts',
    10_000
  );

/** Hourly long-term history of the last `hours`. */
export const useMonitorHistory = (hours: number) =>
  useStatsQuery(
    () => AdminMonitorApi.history(hours),
    result => result.history,
    `monitor-history-${hours}`,
    60_000
  );
