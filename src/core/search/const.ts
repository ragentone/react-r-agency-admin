/** Minimum characters before searching. */
export const SEARCH_MIN_LENGTH = 2;
/** Wait after typing before the request. */
export const SEARCH_DEBOUNCE_MS = 300;
/** Results per bundle (backend `searchOptions.limit`, default 25). */
export const SEARCH_LIMIT = 10;
/** Recent search terms kept (per browser). */
export const SEARCH_RECENT_MAX = 8;

export const SEARCH_STORAGE_RECENT = 'search:recent';
export const SEARCH_STORAGE_BUNDLES = 'search:bundles';
