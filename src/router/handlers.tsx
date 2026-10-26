import type { IRouterContext } from '@router/types.ts';
import type { ParsedLocation } from '@tanstack/react-router';

/**
 * Represents the result of a route handler, which defines optional redirection
 * rules, query parameters, and route parameters relevant to the routing process.
 *
 * This interface is designed to standardize the output of route handlers, enabling
 * consistent behavior across different routing scenarios.
 *
 * Properties:
 * - `redirect` (optional): A string representing the URL or route to which the user
 *   should be redirected. If undefined, no redirection is performed.
 * - `search` (optional): An object containing key-value pairs that represent query
 *   parameters to be appended to the URL. Keys and values are strings.
 * - `params` (optional): An object containing key-value pairs for route parameters,
 *   typically extracted from dynamic segments in the URL. Keys and values are strings.
 */
export interface IRouteHandlerResult {
  redirect?: string;
  search?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * Represents the arguments provided before a load operation in a routing context.
 */
interface IBeforeLoadArgs {
  context: IRouterContext;
  search<T extends Record<any, any>>(): T;
  params<T extends Record<any, any>>(): T;
  location: ParsedLocation;
}

/**
 * Represents an interface for handling routing logic with optional hooks for authentication-related processes.
 */
export interface IAuthRouteHandlers {
  beforeLoad?: (args: IBeforeLoadArgs) => Promise<IRouteHandlerResult | void>;
  loader?: () => Promise<void>;
}

/**
 * Interface representing the handlers for index route operations.
 */
export interface IIndexRouteHandlers {
  beforeLoad?: (args: IBeforeLoadArgs) => Promise<IRouteHandlerResult | void>;
  loader?: () => Promise<void>;
}

/**
 * An object representing handlers for authentication-related routes.
 * This object defines optional lifecycle hooks that can be used to manage
 * behavior during route transitions in authentication flows.
 */
export const AuthRouteHandlers: IAuthRouteHandlers = {
  beforeLoad: undefined,
  loader: undefined,
};

/**
 * An object representing route handlers for the index route.
 * This object contains handlers that can be used to manage the lifecycle events
 * of the index route, such as actions to perform before the route loads or
 * during the route loading process.
 */
export const IndexRouteHandlers: IIndexRouteHandlers = {
  beforeLoad: undefined,
  loader: undefined,
};
