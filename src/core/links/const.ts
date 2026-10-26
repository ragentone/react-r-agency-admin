/** Base path of the link pages (`/link/<id>`). */
export const LINK_ROUTE_BASE = '/link';

/** Runtime route of a link page (registered in core.tsx, target `index` → public). */
export const LINK_ROUTE = `${LINK_ROUTE_BASE}/$linkId`;

/** Path of a link page, e.g. `/link/imprint` or `/link/timeline%3Aterms`. */
export const getLinkPath = (id: string) => `${LINK_ROUTE_BASE}/${encodeURIComponent(id)}`;

/** True on a link page (`/link/<id>`). */
export const isLinkPath = (pathname: string) => pathname.startsWith(`${LINK_ROUTE_BASE}/`);

/**
 * Legacy search param of the former link drawer (`?link=<id>`). Old deep links are
 * redirected to the link page by `LinkRouteHost`; `<a href="?link=terms">` in HTML still works.
 */
export const LINK_SEARCH_KEY = 'link';

/** Default groups of the links menu. */
export const LINK_GROUP_LEGAL = 'legal';
export const LINK_GROUP_DEFAULT = 'links';

/** Links menu slides in from the right (like the settings drawer). */
export const LINKS_MENU_SIDE = 'right' as const;
