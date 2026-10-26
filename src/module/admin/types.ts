import type { PageBlock } from './blocks/types';

export type AdminRoleAction = 'add' | 'remove' | 'change';

/** User as sent by the backend (`IAdminUserItem`). */
export interface IAdminUser {
  id: string;
  alias: string;
  email: string;
  avatarUrl: string | null;
  /** Active roles, sorted. */
  roles: string[];
  /** Can't be removed / changed for this user. */
  protectedRoles: string[];
  superUser: boolean;
  /** The signed-in admin. */
  self: boolean;
  /** Super user of somebody else – read only. */
  locked: boolean;
  active: boolean;
  blocked: boolean;
  lastLogin: string | null;
}

/** Result of a role change – `error` is a key of the `admin` namespace. */
export interface IAdminRoleResult {
  ok: boolean;
  user?: IAdminUser;
  error?: string;
}

export type AdminRoleUpdate =
  /** Several roles at once (`adminRoleAdd`, all or nothing). */
  | { action: 'add'; roles: string[] }
  | { action: 'remove'; role: string }
  | { action: 'change'; role: string; to: string };

/** Who may see a page (backend `SITE_PAGE_VISIBILITIES`). */
export type SitePageVisibility = 'all' | 'authenticated';

/** Dynamic page as sent by the backend (`ISitePageData`). */
export interface ISitePage {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** Sanitized HTML of older pages (before blocks) – empty in `adminPageList`. */
  content: string;
  /** Building blocks – empty in `adminPageList`. */
  blocks: PageBlock[];
  published: boolean;
  publishedAt: string | null;
  /** Listed in the "Pages" group of the main menu (when published). */
  showInMenu: boolean;
  /** Search engines may index it (`index` meta + sitemap). */
  seoIndex: boolean;
  /** Position in the menu group – lower first. */
  menuOrder: number;
  /** `all` = everybody, `authenticated` = signed-in users only. */
  visibility: SitePageVisibility;
  /** `authenticated`: one of these roles is required (empty = every signed-in user). */
  roles: string[];
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ISitePageValues {
  slug: string;
  title: string;
  summary: string;
  content: string;
  blocks: PageBlock[];
  published: boolean;
  showInMenu: boolean;
  seoIndex: boolean;
  menuOrder: number;
  visibility: SitePageVisibility;
  roles: string[];
}

/** Entry of the "Pages" group in the main menu (`sitePageMenu`). */
export interface ISitePageMenuItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  menuOrder: number;
}

/** Result of create / update / delete – `error` is a key of the `admin` namespace. */
export interface ISitePageResult {
  ok: boolean;
  page?: ISitePage;
  error?: string;
}
