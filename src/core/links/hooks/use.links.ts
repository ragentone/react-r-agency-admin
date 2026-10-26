import { useAuth } from '@core/auth/components/use.auth.ts';
import { hasRoles } from '@core/auth/roles/roles.ts';
import type { IMenuContext } from '@core/menu/types.ts';
import { useRouterState } from '@tanstack/react-router';
import { useMemo, useSyncExternalStore } from 'react';

import { linkGroupOf, LinkManager } from '../manager.ts';
import type { ILinkEntry, ILinkGroupConfig } from '../types.ts';

export interface IResolvedLinkGroup {
  id: string;
  config: ILinkGroupConfig;
  links: ILinkEntry[];
}

/** Subscribes to the link registry. */
export const useLinkRegistry = () => {
  useSyncExternalStore(LinkManager.subscribe, LinkManager.getVersion, LinkManager.getVersion);
  return { entries: LinkManager.getEntries(), groups: LinkManager.getGroups() };
};

/** Context + visibility check (audience, roles, `visible`) – same rules as the main menu. */
export const useLinkAccess = () => {
  const { authorized, userMeta } = useAuth();
  const pathname = useRouterState({ select: state => state.location.pathname });
  return useMemo(() => {
    const ctx: IMenuContext = {
      authorized: Boolean(authorized && userMeta),
      user: userMeta,
      pathname,
    };
    const allowed = (entry: ILinkEntry) => {
      const audience = entry.audience ?? 'all';
      if (audience === 'user' && !ctx.authorized) return false;
      if (audience === 'guest' && ctx.authorized) return false;
      if (entry.roles !== undefined && (!ctx.authorized || !hasRoles(ctx.user, entry.roles))) {
        return false;
      }
      return entry.visible ? entry.visible(ctx) : true;
    };
    return { ctx, allowed };
  }, [authorized, userMeta, pathname]);
};

/** Visible links of the current user, grouped and sorted (links menu). */
export const useLinks = (options: { groups?: string[] } = {}) => {
  const { entries, groups } = useLinkRegistry();
  const { allowed, ctx } = useLinkAccess();
  const filter = options.groups?.join('|');

  return useMemo(() => {
    const only = filter ? filter.split('|') : null;
    const links = entries.filter(
      entry => allowed(entry) && (!only || only.includes(linkGroupOf(entry)))
    );
    const grouped = new Map<string, ILinkEntry[]>();
    links.forEach(link => {
      const id = linkGroupOf(link);
      grouped.set(id, [...(grouped.get(id) ?? []), link]);
    });
    const resolved: IResolvedLinkGroup[] = [...grouped.entries()]
      .map(([id, groupLinks]) => ({
        id,
        config: groups[id] ?? { label: id, sortOrder: 50 },
        links: groupLinks,
      }))
      .sort((a, b) => a.config.sortOrder - b.config.sortOrder);
    return { links, groups: resolved, ctx };
  }, [entries, groups, allowed, ctx, filter]);
};
