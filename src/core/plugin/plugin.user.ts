import { useContext, useMemo } from 'react';

import { AuthContext } from '@core/auth/components/auth.context';
import { hasRoles } from '@core/auth/roles/roles';
import { type ClientPlatform, useClientPlatform } from '@core/native';

/**
 * - `loading`: the login state is not known yet (show nothing or a placeholder).
 * - `guest`: nobody is logged in.
 * - `user`: logged in and the user's data is loaded.
 */
export type PluginAuthStatus = 'loading' | 'guest' | 'user';

/** The logged-in user as the frontend knows it. No token, no password. */
export interface IPluginUser {
  id: string | null;
  alias: string | null;
  email: string | null;
  avatarUrl: string | null;
  /** ISO time of the last login activity, `null` if unknown. */
  lastLogin: string | null;
}

export interface IPluginUserState {
  status: PluginAuthStatus;
  /** `true` only when `status` is `user`. */
  loggedIn: boolean;
  user: IPluginUser | null;
  /** Role check for the current user, e.g. `can('admin:user')`. Always `false` for guests. */
  can: (role: string) => boolean;
}

/** Hook for plugin components: whether a user is logged in, and who. Re-renders on login and logout. */
export const usePluginUser = (): IPluginUserState => {
  const context = useContext(AuthContext);
  const authorized = Boolean(context?.authorized);
  const loaded = Boolean(context?.loaded);
  const meta = context?.userMeta ?? null;

  return useMemo<IPluginUserState>(() => {
    const status: PluginAuthStatus =
      authorized && meta ? 'user' : !authorized && loaded ? 'guest' : 'loading';
    return {
      status,
      loggedIn: status === 'user',
      user:
        status === 'user' && meta
          ? {
              id: meta.id ?? null,
              alias: meta.alias ?? null,
              email: meta.email ?? null,
              avatarUrl: meta.avatarUrl ?? null,
              lastLogin: toIsoOrNull(meta.lastLogin),
            }
          : null,
      can: role => status === 'user' && hasRoles(meta, role),
    };
  }, [authorized, loaded, meta]);
};

/** Client platform: Android, iOS or macOS app, otherwise web. */
export type PluginClientPlatform = ClientPlatform;

/** Current client platform. Hook: re-renders when the native app reports its platform. */
export const usePluginPlatform = (): PluginClientPlatform => useClientPlatform();

/** ISO string of a date value, `null` for missing or invalid values. */
const toIsoOrNull = (value: unknown): string | null => {
  if (value == null) return null;
  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : (value as string | number));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
