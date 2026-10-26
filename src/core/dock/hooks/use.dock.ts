import { useAuth } from '@core/auth/components/use.auth.ts';
import { hasRoles } from '@core/auth/roles/roles.ts';
import { useRouterState } from '@tanstack/react-router';
import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import { DockManager } from '../manager.ts';
import type { IDockButtonEntry, IDockMenuContext, IDockMenuItem } from '../types.ts';

/** Sorted dock entries + hidden flag, re-renders on every registry change. */
export const useDock = () => {
  const version = useSyncExternalStore(
    DockManager.subscribe,
    DockManager.getVersion,
    DockManager.getVersion
  );
  return useMemo(
    () => ({ entries: DockManager.getEntries(), hidden: DockManager.isHidden() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );
};

/**
 * Shows a button in the dock while the calling component is mounted.
 * Pass `null` / `false` to remove it (e.g. guests). `onClick` may change every render –
 * the latest one is called without re-registering.
 *
 * ```tsx
 * useDockButton(authorized && { id: 'timeline.compose', label: t('create.title'),
 *   icon: Feather, variant: 'primary', align: 'right', onClick: () => setOpen(true) });
 * ```
 */
export const useDockButton = (entry: IDockButtonEntry | null | false | undefined) => {
  const onClickRef = useRef<(() => void) | undefined>(undefined);
  useLayoutEffect(() => {
    onClickRef.current = entry ? entry.onClick : undefined;
  });

  const enabled = Boolean(entry);
  const { id, label, icon, variant, badge, active, disabled, align, sortOrder, tooltip } =
    entry || {};

  useEffect(() => {
    if (!enabled || !id || !label || !icon) return;
    return DockManager.register({
      id,
      label,
      icon,
      variant,
      badge,
      active,
      disabled,
      align,
      sortOrder,
      tooltip,
      onClick: () => onClickRef.current?.(),
    });
  }, [enabled, id, label, icon, variant, badge, active, disabled, align, sortOrder, tooltip]);
};

/** Hides the dock while the calling component is mounted (e.g. fullscreen pages). */
export const useHideDock = (hide = true) => {
  useEffect(() => {
    if (!hide) return;
    return DockManager.hide();
  }, [hide]);
};

/** Visible dropdown items for the current user (visibility + roles), grouped. */
export const useDockMenu = () => {
  const version = useSyncExternalStore(
    DockManager.subscribe,
    DockManager.getVersion,
    DockManager.getVersion
  );
  const { authorized, userMeta } = useAuth();
  const pathname = useRouterState({ select: state => state.location.pathname });

  return useMemo(() => {
    const ctx: IDockMenuContext = {
      authorized: Boolean(authorized && userMeta),
      user: userMeta,
      pathname,
    };
    const items = DockManager.getMenuItems().filter(item => {
      const visibility = item.visibility ?? 'always';
      if (visibility === 'authenticated' && !ctx.authorized) return false;
      if (visibility === 'guest' && ctx.authorized) return false;
      if (item.roles !== undefined && (!ctx.authorized || !hasRoles(ctx.user, item.roles))) {
        return false;
      }
      return true;
    });
    // Groups in order of their first item.
    const groups = new Map<string, IDockMenuItem[]>();
    items.forEach(item => {
      const key = item.group ?? '';
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });
    return { ctx, items, groups: [...groups.values()] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, authorized, userMeta, pathname]);
};
