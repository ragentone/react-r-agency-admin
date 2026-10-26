import { ErrorFallback } from '@core/error';
import { Events } from '@core/event/events.ts';
import { PageManager } from '@core/page/page.manager.tsx';
import { routeTree } from '@generated/routerTree.tsx';
import { createDynamicRoute } from '@router/utils.tsx';
import { type AnyRoute, createRouter, type NotFoundRouteProps } from '@tanstack/react-router';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';
import { createElement, type FunctionComponent } from 'react';

import { getRouteMeta, setRouteTitle } from './route.title.ts';
import type { IBaseRouter, IRouteRegister } from './types.ts';

export * from './components';

/**
 * A storage container for registered routes.
 *
 * This variable is a Map where:
 * - The key is a string representing the route path.
 * - The value is an object implementing the IRouteRegister interface,
 *   which contains metadata and configuration for the route.
 * This map is used to manage and retrieve route definitions
 * within the application, providing centralized route registration.
 */
const routeStorage: Map<string, IRouteRegister> = new Map();
/**
 * Represents an instance of the Mesh client.
 * The `client` variable provides methods and properties for interacting
 * with a Mesh service. The exact functionality depends on the specifics
 * of the service implemented by the Mesh client.
 */
const client = getMeshClient();

client.config({
  endpoint: import.meta.env.VITE_MESH_SERVER_ENDPOINT,
});

// `x-auth-token` header: set by MeshProvider (core/mesh), which also removes the hook on unmount.
/**
 * Registers a new route and adds it to the route storage and tree.
 *
 * This function creates a dynamic route from the given route definition
 * and stores it in the route storage with its path as the key.
 * Additionally, it appends the new route to the route tree's children.
 * @param {IRouteRegister} route - The route object to be registered.
 * Includes details such as the path and configuration for the route.
 */
const registerRoute = (route: IRouteRegister) => {
  routeStorage.set(route.path, route);
};

/**
 * File routes of the generated tree – captured once. Dynamic routes are appended in
 * `createBaseRouter()` instead of at import time, so a regenerated `routerTree.tsx`
 * (hot reload) can't lose them and re-registering a path replaces instead of duplicating.
 */
const fileRoutes = [...((routeTree.children as AnyRoute[] | undefined) ?? [])];

/**
 * Initializes and returns a base router instance with predefined configurations.
 * The createBaseRouter function sets up a router using a specific route tree and configurations.
 * It defines the default behavior for handling not-found components, establishes a context
 * with utilities such as client, storage, and bus events, and subscribes to the 'onLoad' event.
 */
const createBaseRouter = () => {
  const dynamicRoutes = Array.from(routeStorage.values()).map(createDynamicRoute);
  routeTree.addChildren([...fileRoutes, ...dynamicRoutes]);

  return createRouter({
    routeTree: routeTree,
    defaultPendingMinMs: 0,
    // Resolved at render time (apps can replace the 404 page via Core.page.setPage).
    defaultNotFoundComponent: props =>
      createElement(PageManager.getPage('404') as FunctionComponent<NotFoundRouteProps>, props),
    defaultErrorComponent: ErrorFallback,
    context: {
      client: client,
      events: Events,
    },
  });
};

const BaseRouter: IBaseRouter = {
  register: registerRoute,
};

export { BaseRouter, createBaseRouter, getRouteMeta, registerRoute, setRouteTitle };
