/** Cron jobs – only `admin:user` (route guard `_admin` + runtime `shared/cron`). */
export const ADMIN_CRON_ROUTE = '/admin/cron';
export const ADMIN_CRON_ROLES = 'admin:user';

/** Reload interval of the job list (status, next run). */
export const ADMIN_CRON_POLL_MS = 10_000;
