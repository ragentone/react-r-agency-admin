import { graphql } from '@generated/graphql';
import { parse } from 'graphql';

/** `admin:user` only – alias / e-mail / id, empty term → newest users (without the admin). */
export const AdminUserSearchQuery = graphql(`
  query AdminUserSearch($term: String, $limit: Int, $offset: Int) {
    adminUserSearch(term: $term, limit: $limit, offset: $offset) {
      success
      total
      users
    }
  }
`);

/** `admin:user` only – one user, also the admin himself (`self: true`). */
export const AdminUserGetQuery = graphql(`
  query AdminUserGet($userId: ID!) {
    adminUserGet(userId: $userId) {
      success
      user
    }
  }
`);

/** `admin:user` only – `add` / `remove` `role` or `change` `role` → `to`. */
export const AdminRoleUpdateMutation = graphql(`
  mutation AdminRoleUpdate($userId: ID!, $action: String!, $role: String!, $to: String) {
    adminRoleUpdate(userId: $userId, action: $action, role: $role, to: $to) {
      success
      user
    }
  }
`);

/*
 * Dynamic pages (runtime apps/site-page): parsed here instead of `graphql()` from codegen –
 * an operation codegen hasn't seen yet (Vite not restarted) would be an empty object and
 * break the request.
 */

/**
 * `admin:user` only – roles registered in the runtime (`definitions` with texts per language,
 * `groups`) + every role still in use (`roles`). Parsed directly: new fields codegen may not know.
 */
export const AdminRoleListQuery = parse(`
  query AdminRoleList {
    adminRoleList {
      success
      roles
      definitions
      groups
    }
  }
`);

/** `admin:user` only – several roles at once (all or nothing). */
export const AdminRoleAddMutation = parse(`
  mutation AdminRoleAdd($userId: ID!, $roles: JSON!) {
    adminRoleAdd(userId: $userId, roles: $roles) {
      success
      user
    }
  }
`);

/** `admin:user` only – every page (drafts too) without content. */
export const AdminPageListQuery = parse(`
  query AdminPageList {
    adminPageList {
      success
      pages
    }
  }
`);

/** `admin:user` only – one page incl. content. */
export const AdminPageGetQuery = parse(`
  query AdminPageGet($id: ID!) {
    adminPageGet(id: $id) {
      success
      page
    }
  }
`);

export const AdminPageCreateMutation = parse(`
  mutation AdminPageCreate($values: JSON!) {
    adminPageCreate(values: $values) {
      success
      page
    }
  }
`);

export const AdminPageUpdateMutation = parse(`
  mutation AdminPageUpdate($id: ID!, $values: JSON!) {
    adminPageUpdate(id: $id, values: $values) {
      success
      page
    }
  }
`);

export const AdminPageDeleteMutation = parse(`
  mutation AdminPageDelete($id: ID!) {
    adminPageDelete(id: $id) {
      success
    }
  }
`);

/** Public – published pages of the main menu group. */
export const SitePageMenuQuery = parse(`
  query SitePageMenu {
    sitePageMenu {
      success
      items
    }
  }
`);

/** Public – published pages; drafts only for `admin:user` (preview). */
export const SitePageGetQuery = parse(`
  query SitePageGet($slug: String!) {
    sitePageGet(slug: $slug) {
      success
      page
    }
  }
`);

/** Drops unsaved uploads – the server only deletes images no page uses. */
export const AdminPageImageDiscardMutation = parse(`
  mutation AdminPageImageDiscard($urls: [String]!) {
    adminPageImageDiscard(urls: $urls) {
      success
      removed
    }
  }
`);

/** Heartbeat of an open editor – keeps its unsaved uploads, `missing` = already gone. */
export const AdminPageImageKeepMutation = parse(`
  mutation AdminPageImageKeep($urls: [String]!) {
    adminPageImageKeep(urls: $urls) {
      success
      missing
    }
  }
`);

/** `admin:user` only – one image for a block, returns its url. */
export const AdminPageImageUploadMutation = parse(`
  mutation AdminPageImageUpload($file: [Upload]!) {
    adminPageImageUpload(file: $file) {
      success
      url
    }
  }
`);
