/** Admin area – full page, only `admin:user` (route guard `_admin` + backend). */
export const ADMIN_ROUTE = '/admin';
/** Dynamic pages of the admin area (own route + menu entry). */
export const ADMIN_PAGES_ROUTE = '/admin/pages';
/** Visitor statistics (runtime shared/stats). */
export const ADMIN_STATS_ROUTE = '/admin/stats';
/** Version, deploys, server storage (runtime shared/system). */
export const ADMIN_SYSTEM_ROUTE = '/admin/system';
/** localStorage keys of the last tab – the admin home sets them to open a tab directly. */
export const ADMIN_STATS_VIEW_KEY = 'admin-stats-view';
export const ADMIN_SYSTEM_VIEW_KEY = 'admin-system-view';
/** Who may use it – same check as the backend (`@GraphqlAuth({ role: 'admin:user' })`). */
export const ADMIN_ROLES = 'admin:user';

export const ROLE_ADMIN = 'admin:user';
export const ROLE_DEFAULT = 'default:user';

export const ADMIN_SEARCH_LIMIT = 30;
/** Users are only loaded via the search – from this many characters on. */
export const ADMIN_SEARCH_MIN = 2;
export const ADMIN_SEARCH_DEBOUNCE = 300;

/**
 * Display only – the backend enforces the same rules:
 * other users → `default:user`, own account → `admin:user` + `default:user`.
 */
export const protectedRolesFor = (self: boolean): string[] =>
  self ? [ROLE_ADMIN, ROLE_DEFAULT] : [ROLE_DEFAULT];

/** Public route of a dynamic page – same slug rule as the backend (runtime apps/site-page). */
export const SITE_PAGE_ROUTE = '/p/$slug';
export const sitePagePath = (slug: string) =>
  SITE_PAGE_ROUTE.replace('$slug', encodeURIComponent(slug));

/** Limits – same as the backend (`SITE_PAGE_*`). */
export const SITE_PAGE_TITLE_MAX = 150;
export const SITE_PAGE_SLUG_MAX = 80;
export const SITE_PAGE_SUMMARY_MAX = 300;
/** Visible characters of the content (the backend limits raw HTML to 200 000). */
export const SITE_PAGE_CONTENT_MAX = 50000;
export const SITE_PAGE_MENU_ORDER_MIN = -9999;
export const SITE_PAGE_MENU_ORDER_MAX = 9999;
/** Main menu: own section for the published pages (between "Apps" and "User"). */
export const SITE_PAGE_MENU_SECTION = 'pages';
export const SITE_PAGE_MENU_SECTION_ORDER = 50;
export const SITE_PAGE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
