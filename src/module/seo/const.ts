/** SEO admin – only `admin:user` (route guard `_admin` + runtime `adminSeo*`). */
export const ADMIN_SEO_ROUTE = '/admin/seo';
export const SEO_ADMIN_ROLES = 'admin:user';

/** Limits – same as the runtime (`shared/seo/types.ts`). */
export const SEO_PATH_MAX = 200;
export const SEO_TITLE_MAX = 120;
export const SEO_DESCRIPTION_MAX = 320;
export const SEO_URL_MAX = 500;
export const SEO_SITE_NAME_MAX = 80;
export const SEO_JSON_LD_MAX = 10000;
export const SEO_SAME_AS_MAX = 10;
export const SEO_PATH_PATTERN = /^\/(?:[a-z0-9._~$-]+(?:\/[a-z0-9._~$-]+)*)?(?:\/\*)?$/i;

/** What Google shows before cutting off – hints only, the limits above are hard. */
export const SEO_TITLE_IDEAL = 60;
export const SEO_DESCRIPTION_IDEAL = 160;

export const SEO_CHANGEFREQS = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
] as const;

export const SEO_PRIORITIES = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0] as const;
