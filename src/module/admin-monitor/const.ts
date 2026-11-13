/** Server monitor – only `admin:user` (route guard `_admin` + runtime `adminMonitorSnapshot`). */
export const ADMIN_MONITOR_ROUTE = '/admin/monitor';
export const ADMIN_MONITOR_ROLES = 'admin:user';

/** Reload interval (matches the sampler of the runtime, `MONITOR_LIMITS.intervalMs`). */
export const ADMIN_MONITOR_POLL_MS = 5_000;

/** Selectable time ranges in minutes. */
export const ADMIN_MONITOR_RANGES = [5, 15, 60] as const;

/** Selectable long-term history ranges in hours. */
export const ADMIN_MONITOR_HISTORY_RANGES = [24, 72, 168] as const;
