import type { RouteTarget } from '@router/types.ts';
import type { MakeRouteMatchUnion, ParsedLocation } from '@tanstack/react-router';
import type { IMesh } from 'r-agency-mesh-client-v1/release';

import type { IRouterRouteMeta } from './types.ts';

/**
 * Extends the StaticDataRouteOption interface from the `@tanstack/react-router` module
 * to include a customData property.
 * @module @tanstack/react-router
 */
declare module '@tanstack/react-router' {
  /**
   * Represents a route option with optional metadata for static data routes.
   * @interface StaticDataRouteOption
   * @property {IRouterRouteMeta} [meta] - Optional metadata associated with the route.
   */
  interface StaticDataRouteOption {
    meta?: IRouterRouteMeta;
  }
}

declare module 'event/global' {
  export interface ICoreEventMap {
    'router:before_load_route': {
      payload: {
        client: IMesh;
        location: ParsedLocation;
        target: RouteTarget;
        matches: MakeRouteMatchUnion[];
      };
      data: {
        redirect?: string;
      };
    };
    'router:before_load_auth_route': {
      payload: {
        client: IMesh;
        location: ParsedLocation;
        target: RouteTarget;
        matches: MakeRouteMatchUnion[];
      };
      data: object;
    };
    'router:before_load_admin_route': {
      payload: {
        client: IMesh;
        location: ParsedLocation;
        target: RouteTarget;
        matches: MakeRouteMatchUnion[];
      };
      data: {
        redirect?: string;
      };
    };
  }
  export type ICustomEventMap = object;
}

export {};
