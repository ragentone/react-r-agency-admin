import { UserRoleManager } from '@core/auth/roles/role.manager.ts';
import { PageBlockManager } from '@core/blocks/manager.ts';
import { CmsManager } from '@core/cms/cms.manager.ts';
import { DockManager } from '@core/dock/manager.ts';
import { Events } from '@core/event/events.ts';
import { ExtensionManager } from '@core/extension/extension.manager.ts';
import { LinkManager } from '@core/links/manager.ts';
import { MenuManager } from '@core/menu/manager.ts';
import { PageManager } from '@core/page/page.manager.tsx';
import { ProviderManager } from '@core/provider/manager.ts';
import { SearchManager } from '@core/search/manager.ts';
import type { ICore } from '@core/types.ts';
import { BaseRouter } from '@router/index.ts';

/**
 * Represents the core functionality of the application.
 * Provides access to essential components and managers used throughout the system.
 *
 * @type {ICore}
 * @property {BaseRouter} router - Manages the application's routing and navigation.
 * @property {PageManager} page - Manages the lifecycle and interactions of application pages.
 * @property {ExtensionManager} extension - Handles extensions and plugins within the application.
 * @property {CmsManager} cms - Manages content management system features and operations.
 * @property {Events} events - Provides event handling and event-driven architecture support.
 * @property {MenuManager} menu - Registry of the main menu entries (apps register theirs in `app.tsx`).
 * @property {DockManager} dock - Buttons of the floating mobile bar (static or via `useDockButton`).
 * @property {LinkManager} links - Imprint, terms, privacy + custom links (links menu, content drawer).
 * @property {UserRoleManager} roles - Registry of user roles (apps register theirs, admin area offers them).
 * @property {PageBlockManager} blocks - App blocks for dynamic pages (see src/core/blocks/README.md).
 */
export const Core: ICore = {
  router: BaseRouter,
  page: PageManager,
  extension: ExtensionManager,
  cms: CmsManager,
  events: Events,
  provider: ProviderManager,
  menu: MenuManager,
  dock: DockManager,
  search: SearchManager,
  links: LinkManager,
  roles: UserRoleManager,
  blocks: PageBlockManager,
};
