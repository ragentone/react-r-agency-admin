import {
  type AnyRoute,
  type NavigateFn,
  type ParsedLocation,
  type RouteMatch,
  type RouterState,
} from '@tanstack/react-router';
import type { IMesh } from 'r-agency-mesh-client-v1/release';
import type { ZodObject } from 'zod/v4';
import type { IEvents } from '@core/event';
/**
 * Interface representing the Router context.
 * This interface defines the structure of an object that provides the necessary components
 * for the router's operation, including a client and storage mechanism.
 */
export interface IRouterContext {
  client: IMesh;
  events: IEvents;
}

/**
 * Interface representing the metadata associated with a router route.
 * This interface is used to define optional metadata properties
 * that can be attached to a route in a routing system.
 */
export interface IRouterRouteMeta {
  title?: string;
  scope?: string;
}

export type RouteTarget = 'index' | 'auth' | 'admin';

export interface IRouteMaybeSearch {
  lang?: string;
}

export interface IRouterOnResolveEvent {
  location: ParsedLocation;
  state: RouterState;
  navigate: NavigateFn;
  pathChanged: boolean;

  search<TSearch = object>(): TSearch & IRouteMaybeSearch;
}

export interface IRouterForwardArgs {
  path: string;
  params?: Record<string, unknown>;
}

export interface IRouteLoaderFnArgs<TSearch = unknown, TParams = unknown> {
  context: IRouterContext;
  search: TSearch;
  location: ParsedLocation;
  params: TParams;
}

export interface IRouteBeforeLoadFnArgs<TSearch = unknown, TParams = unknown> {
  context: IRouterContext;
  search: TSearch;
  location: ParsedLocation;
  params: TParams;
}

export interface IRouteProps<Params = any, Search = any, Data = any> {
  route: Omit<AnyRoute, 'addChildren'>;
  params: Params;
  search: Search;
  data: Data;
}

export type RoutePageFn = (args: IRouteProps) => unknown;

export interface IRouteRegister {
  id?: string;
  path: string;
  target: RouteTarget;
  page: RoutePageFn;
  errorPage?: unknown;
  meta?: IRouterRouteMeta;
  paramsSchema?: ZodObject;

  loader?(args: IRouteLoaderFnArgs): Promise<unknown>;

  beforeLoad?(args: IRouteBeforeLoadFnArgs): Promise<unknown>;

  onEnter?(match: RouteMatch<unknown, unknown, unknown, unknown, unknown, unknown, unknown>): void;

  onLeave?(match: RouteMatch<unknown, unknown, unknown, unknown, unknown, unknown, unknown>): void;
}

export interface IBaseRouter {
  register(route: IRouteRegister): void;
}
