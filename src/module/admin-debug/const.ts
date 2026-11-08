/** Client debug reports – only `admin:user` (route guard `_admin` + runtime `debugReportList`). */
export const ADMIN_DEBUG_ROUTE = '/admin/debug';
export const ADMIN_DEBUG_ROLES = 'admin:user';

/** Rows per page of the report table (the runtime caps `pageSize` at 100). */
export const ADMIN_DEBUG_PAGE_SIZE = 25;
