import type { MakeRouteMatchUnion } from '@tanstack/react-router';

import type { IRouterRouteMeta } from './types.ts';

/**
 * Route title helpers – own module without imports of the route tree, so route files can use
 * them without a cycle (`router/index` → routeTree → route → `router/index` breaks on HMR).
 */

/** Retrieves the metadata associated with the last route match in the provided list of route matches. */
export const getRouteMeta = (matches: MakeRouteMatchUnion[]): IRouterRouteMeta | undefined => {
  return matches.at(-1)?.staticData?.meta;
};

/** Updates the document's title based on the metadata of the current route matches. */
export const setRouteTitle = (matches: MakeRouteMatchUnion[]) => {
  document.title = getRouteMeta(matches)?.title ?? 'Application';
};
