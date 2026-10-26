import { hasRoles } from '@core/auth/roles/roles.ts';
import { useRouterState } from '@tanstack/react-router';
import { useEffect, useMemo, useSyncExternalStore } from 'react';

import { useAuth } from '../../auth/components/use.auth.ts';
import { MenuManager } from '../manager.ts';
import type {
  IMenuComponentEntry,
  IMenuContext,
  IMenuEntry,
  IMenuSectionConfig,
} from '../types.ts';

export interface IResolvedMenuEntry {
  entry: IMenuEntry;
  href?: string;
  /** This entry or (for a group) one of its children matches the route. */
  active: boolean;
  /** Visible, resolved sub entries (empty / undefined = no group). */
  children?: IResolvedMenuEntry[];
}

/** One row of a section: a link entry or a registered component, in `sortOrder`. */
export type MenuNode =
  | { type: 'item'; id: string; item: IResolvedMenuEntry }
  | { type: 'component'; id: string; component: IMenuComponentEntry };

export interface IResolvedMenuSection {
  id: string;
  config: IMenuSectionConfig;
  items: IResolvedMenuEntry[];
  /** Entries + components of this section, sorted. */
  nodes: MenuNode[];
}

const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

const isActive = (entry: IMenuEntry, href: string | undefined, pathname: string) => {
  if (entry.match) return entry.match(pathname);
  if (!href) return false;
  const target = normalize(href.split(/[?#]/)[0]);
  const current = normalize(pathname);
  if (entry.exact || target === '/') return current === target;
  return current === target || current.startsWith(`${target}/`);
};

const sortOf = (node: MenuNode) =>
  (node.type === 'item' ? node.item.entry.sortOrder : node.component.sortOrder) ?? 0;

/** Subscribes to the menu registry (re-renders on register/unregister/hide). */
export const useMenuRegistry = () => {
  useSyncExternalStore(MenuManager.subscribe, MenuManager.getVersion, MenuManager.getVersion);
  return {
    entries: MenuManager.getEntries(),
    components: MenuManager.getComponents(),
    sections: MenuManager.getSections(),
    hidden: MenuManager.isHidden(),
  };
};

/** Visible, resolved menu entries for the current user and route. */
export const useMenu = () => {
  const { entries, components, sections, hidden } = useMenuRegistry();
  const { authorized, userMeta } = useAuth();
  const pathname = useRouterState({ select: state => state.location.pathname });

  return useMemo(() => {
    const ctx: IMenuContext = {
      authorized: Boolean(authorized && userMeta),
      user: userMeta,
      pathname,
    };

    const allowed = (entry: Pick<IMenuEntry, 'audience' | 'visible' | 'roles'>) => {
      const audience = entry.audience ?? 'all';
      if (audience === 'user' && !ctx.authorized) return false;
      if (audience === 'guest' && ctx.authorized) return false;
      if (entry.roles !== undefined && (!ctx.authorized || !hasRoles(ctx.user, entry.roles))) {
        return false;
      }
      return entry.visible ? entry.visible(ctx) : true;
    };

    const visibleComponents = components.filter(allowed);
    const footer = visibleComponents.filter(entry => (entry.placement ?? 'footer') === 'footer');
    const inline = visibleComponents.filter(entry => entry.placement === 'section');
    const settings = visibleComponents.filter(entry => entry.placement === 'settings');

    const resolve = (entry: IMenuEntry): IResolvedMenuEntry => {
      const href = typeof entry.to === 'function' ? entry.to(ctx) : entry.to;
      return { entry, href, active: isActive(entry, href, pathname) };
    };
    const usable = (item: IResolvedMenuEntry) =>
      Boolean(item.href || item.entry.onSelect || item.children?.length);

    // Entries nested via `parent` → children of that group (only if the group is registered).
    const ids = new Set(entries.map(entry => entry.id));
    const nested = new Map<string, IMenuEntry[]>();
    entries.forEach(entry => {
      if (entry.parent && entry.parent !== entry.id && ids.has(entry.parent)) {
        nested.set(entry.parent, [...(nested.get(entry.parent) ?? []), entry]);
      }
    });
    const isNested = (entry: IMenuEntry) => Boolean(entry.parent && nested.has(entry.parent));

    // Groups may contain groups (e.g. `administration` inside `user`) – max. 2 levels.
    const resolveTree = (entry: IMenuEntry, depth: number): IResolvedMenuEntry => {
      const item = resolve(entry);
      const children = [...(entry.children ?? []), ...(nested.get(entry.id) ?? [])];
      if (children.length && depth < 2) {
        item.children = children
          .filter(allowed)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id))
          .map(child => resolveTree(child, depth + 1))
          .filter(usable);
      }
      return item;
    };

    const items: IResolvedMenuEntry[] = entries
      .filter(entry => !isNested(entry) && allowed(entry))
      .map(entry => resolveTree(entry, 0))
      .filter(usable);

    // Only the most specific match is active (e.g. `/entry/1` beats `/`) – children included.
    const flatten = (list: IResolvedMenuEntry[]): IResolvedMenuEntry[] =>
      list.flatMap(item => [item, ...flatten(item.children ?? [])]);
    const flat = flatten(items);
    const activeItems = flat.filter(item => item.active);
    if (activeItems.length > 1) {
      const best = activeItems.reduce((a, b) =>
        (b.href?.length ?? 0) > (a.href?.length ?? 0) ? b : a
      );
      activeItems.forEach(item => {
        item.active = item === best;
      });
    }
    // A group counts as active when one of its children is (bottom-up).
    const markActive = (item: IResolvedMenuEntry): boolean => {
      const childActive = (item.children ?? []).map(markActive).some(Boolean);
      if (childActive) item.active = true;
      return item.active;
    };
    items.forEach(markActive);

    const grouped = new Map<string, IResolvedMenuEntry[]>();
    items.forEach(item => {
      const id = item.entry.section ?? 'apps';
      grouped.set(id, [...(grouped.get(id) ?? []), item]);
    });
    inline.forEach(entry => {
      const id = entry.section ?? 'apps';
      if (!grouped.has(id)) grouped.set(id, []);
    });
    const groupedSections: IResolvedMenuSection[] = [...grouped.entries()]
      .map(([id, sectionItems]) => {
        const nodes: MenuNode[] = [
          ...sectionItems.map(item => ({ type: 'item' as const, id: item.entry.id, item })),
          ...inline
            .filter(entry => (entry.section ?? 'apps') === id)
            .map(component => ({ type: 'component' as const, id: component.id, component })),
        ].sort((a, b) => sortOf(a) - sortOf(b));
        return {
          id,
          config: sections[id] ?? { label: id, sortOrder: 50 },
          items: sectionItems,
          nodes,
        };
      })
      .sort((a, b) => a.config.sortOrder - b.config.sortOrder);

    return { ctx, items, sections: groupedSections, footer, settings, hidden };
  }, [entries, components, sections, hidden, authorized, userMeta, pathname]);
};

/** Hides the main menu while the calling component is mounted (e.g. fullscreen pages). */
export const useHideMainMenu = (hide = true) => {
  useEffect(() => {
    if (!hide) return;
    return MenuManager.hide();
  }, [hide]);
};

/** `true` from the given min width (e.g. `1280` = Tailwind `xl`). */
export const useMenuMinWidth = (px: number) => {
  const query = `(min-width: ${px}px)`;
  return useSyncExternalStore(
    listener => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', listener);
      return () => mql.removeEventListener('change', listener);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
};
