'use client';

import { RouteErrorComponent } from '@router/components';
// Route files export only `Route` (TanStack code splitting / HMR) – import it under an alias here.
import { Route as AdminRootRoute } from '@router/routes/_admin/route.tsx';
import { Route as AuthRootRoute } from '@router/routes/_authenticated/route.tsx';
import { Route as IndexRootRoute } from '@router/routes/_index/route.tsx';
import type { IRouteRegister, RouteTarget } from '@router/types.ts';
import { type AnyRoute, createRoute, type RouteComponent } from '@tanstack/react-router';

/**
 * Determines the parent route based on the provided target route identifier.
 * @param {RouteTarget} target - The target route identifier.
 * @returns {AnyRoute} The corresponding parent route for the specified target.
 */
const getRouteParent = (target: RouteTarget): AnyRoute => {
  switch (target) {
    case 'index':
      return IndexRootRoute;
    case 'auth':
      return AuthRootRoute;
    case 'admin':
      // `_admin` layout: `router:before_load_admin_route` (src/core/admin) checks `admin:user`.
      return AdminRootRoute;
  }
};

/**
 * Creates a dynamic route configuration based on the given route definition.
 * The returned route object includes the following:
 * - `path`: The route's path.
 * - `component`: A function that returns the route's component.
 * - `errorComponent`: A predefined error component for route errors.
 * - `getParentRoute`: A function to retrieve the parent route.
 * - `staticData`: Object containing static metadata for the route (e.g., route title).
 * - `onEnter`: A function executed upon entering the route.
 * - `onLeave`: A function executed upon leaving the route.
 * - `validateSearch`: A function to validate the search parameters using the provided schema.
 * - `beforeLoad`: A function invoked before loading the component for the route.
 * - `loader`: A function invoked to preload data for the route.
 * Throws an error if validation of search parameters fails.
 * Handles asynchronous operations for `beforeLoad` and `loader` methods when defined.
 */
const createDynamicRoute = (route: IRouteRegister): AnyRoute => {
  const parent = getRouteParent(route.target);
  const errorPage = route.errorPage ?? RouteErrorComponent;
  const dRoute = createRoute({
    id: route.id,
    path: route.path,
    component: () => {
      return route.page({
        route: dRoute,
        params: dRoute.useParams(),
        search: dRoute.useSearch(),
        data: dRoute.useLoaderData(),
      });
    },
    errorComponent: errorPage as RouteComponent,
    getParentRoute: () => parent,
    staticData: {
      meta: {
        title: route?.meta?.title ?? 'App',
      },
    },
    onEnter: route.onEnter,
    onLeave: route.onLeave,
    validateSearch(search) {
      if (route.paramsSchema) {
        const result = route.paramsSchema.safeParse(search);
        if (result.error) {
          throw new Error(`Invalid search params`);
        }
      }
    },
    async beforeLoad({ context, location, params }) {
      if (!route.beforeLoad) return;
      return await route.beforeLoad({
        context: context,
        search: location.search,
        location: location,
        params: params,
      });
    },
    async loader({ context, location, params }) {
      if (!route.loader) return;
      return await route.loader({
        context: context,
        search: location.search,
        location: location,
        params: params,
      });
    },
  });

  return dRoute;
};

export { createDynamicRoute };
