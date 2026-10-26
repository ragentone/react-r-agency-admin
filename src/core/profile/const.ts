/** Runtime route of a user profile (registered in core.tsx, target `auth` → login required). */
export const PROFILE_ROUTE = '/profile/$userId';

/** Link to a user's profile, e.g. from a timeline entry. */
export const getProfilePath = (userId: string) => `/profile/${encodeURIComponent(userId)}`;

/** Search param of the profile dialog (`?profile=<id>`, shown masked as /profile/<id>). */
export const PROFILE_SEARCH_KEY = 'profile';

/** CMS container on the profile page – apps can add sections (e.g. the user's posts). */
export const PROFILE_CMS_CONTAINER = 'page-profile';

/**
 * Query parameter that opens the profile drawer on any page, e.g. `/?profile-id=<id>`
 * (see `ProfileDrawerHost`). Closing the drawer removes it again.
 */
export const PROFILE_DRAWER_PARAM = 'profile-id';

/**
 * How a profile is shown:
 * - `route`: profile page `/profile/<id>` (default).
 * - `drawer`: bottom sheet above the current page, the URL path stays.
 */
export type ProfileOpenMode = 'route' | 'drawer';

const searchParams = (search?: string | null) =>
  new URLSearchParams(search ? (search.startsWith('?') ? search : `?${search}`) : '');

/** Reads the drawer profile id from a search string (`?profile-id=xyz` → `xyz`). */
export const getProfileDrawerId = (search?: string | null): string | null =>
  searchParams(search).get(PROFILE_DRAWER_PARAM)?.trim() || null;

/** Search string without the drawer parameter (`''` when nothing is left). */
export const withoutProfileDrawerParam = (search?: string | null): string => {
  const params = searchParams(search);
  params.delete(PROFILE_DRAWER_PARAM);
  const rest = params.toString();
  return rest ? `?${rest}` : '';
};

/** Current page with the profile drawer open, e.g. for sharing: `/page/abc?profile-id=xyz`. */
export const getProfileDrawerPath = (userId: string, pathname: string, search?: string | null) => {
  const params = searchParams(search);
  params.set(PROFILE_DRAWER_PARAM, userId);
  return `${pathname}?${params.toString()}`;
};
