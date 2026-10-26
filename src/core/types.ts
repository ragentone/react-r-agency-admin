import type { IUserRoleManager } from '@core/auth/roles/role.manager.ts';
import type { IPageBlockManager } from '@core/blocks/types.ts';
import type { ICmsManager } from '@core/cms';
import type { IDockManager } from '@core/dock/types.ts';
import type { IEvents } from '@core/event';
import type { IExtensionManager } from '@core/extension';
import type { ILinkManager } from '@core/links/types.ts';
import type { IMenuManager } from '@core/menu/types.ts';
import type { IPageManager } from '@core/page';
import type { IProviderManager } from '@core/provider';
import type { ISearchManager } from '@core/search/types.ts';
import type { IBaseRouter } from '@router/types.ts';
import type { ReactNode } from 'react';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ReactChildren<Args extends object = object> = ((args: Args) => ReactNode) | ReactNode;

/**
 * Represents the core interface that provides base functionality and management
 * components required for application operations. It acts as the central hub
 * for routing, page handling, extensions, and content management systems.
 *
 * @interface ICore
 *
 * @property {IBaseRouter} router - Manages the application's routing system.
 * @property {IPageManager} page - Handles the management of pages within the application.
 * @property {IExtensionManager} extension - Controls the lifecycle and integration of extensions.
 * @property {ICmsManager} cms - Oversees operations related to the content management system.
 */
export interface ICore {
  router: IBaseRouter;
  page: IPageManager;
  extension: IExtensionManager;
  cms: ICmsManager;
  events: IEvents;
  provider: IProviderManager;
  menu: IMenuManager;
  dock: IDockManager;
  search: ISearchManager;
  /** Link manager: imprint, terms, privacy + custom links (src/core/links). */
  links: ILinkManager;
  /** User role registry: apps register roles, the admin area offers them (src/core/auth/roles). */
  roles: IUserRoleManager;
  /** App blocks for dynamic pages (src/core/blocks, used by the admin page editor). */
  blocks: IPageBlockManager;
}

/**
 * Interface representing core configuration variables used across the application.
 *
 * Properties:
 * - `routePathAccount`: Specifies the route path associated with account-related operations.
 * - `routePathAuth`: Defines the route path associated with authentication-related processes.
 */
export interface ICoreVariables {
  routePathAccount: string;
  routePathAuth: string;
  routePathHome: string;
  headerTitle?: string;
  headerSubTitle?: string;
}
