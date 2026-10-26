/** Download area – public page, the backend decides which files a caller sees. */
export const FILE_SHARE_ROUTE = '/files';
/** Who may upload / edit / delete – same check as the backend (runtime apps/file-share). */
/** Public download page of a share link (anybody with the link, any visibility). */
export const FILE_SHARE_LINK_ROUTE = '/files/s/$token';
export const fileShareLinkPath = (token: string) =>
  FILE_SHARE_LINK_ROUTE.replace('$token', encodeURIComponent(token));
/** Absolute share link (to copy / send). */
export const fileShareLinkUrl = (token: string) =>
  new URL(fileShareLinkPath(token), window.location.origin).toString();

export const FILE_SHARE_ROLES = ['admin:user'];

/** 25 MB – same as the backend (FILE_SHARE_MAX_FILE_SIZE). */
export const FILE_SHARE_MAX_FILE_SIZE = 120 * 1024 * 1024;
export const FILE_SHARE_TITLE_MAX = 120;
export const FILE_SHARE_DESCRIPTION_MAX = 2000;

/** `private` = only `admin:user` sees the file in the list (share links still work). */
export const FILE_SHARE_VISIBILITIES = ['public', 'authenticated', 'private'] as const;

/** Search field shows up from this many files on. */
export const FILE_SHARE_SEARCH_MIN = 6;
