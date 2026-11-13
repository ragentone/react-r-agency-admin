import { useAuth } from '@core/auth/components/use.auth.ts';
import { useMeshState } from '@core/mesh/components/use.mesh.ts';
import { type ReactNode, useEffect, useRef } from 'react';

import { setPluginAppScope } from './plugin.host';
import { loadActivePlugins, reloadActivePlugins } from './plugin.bootstrap';
import type { PluginScope } from './plugin.types';

interface IPluginProviderProps {
  /** Which plugins to load: `frontend` (default) or `admin`. */
  scope?: PluginScope;
  children: ReactNode;
}

/**
 * Loads the active plugins of a scope once the mesh is connected and the user is signed in
 * (the roles decide which plugins come back). Mount it inside the auth provider.
 */
export const PluginProvider = ({ scope = 'frontend', children }: IPluginProviderProps) => {
  const { connected } = useMeshState();
  const { loaded, authorized, userMeta } = useAuth();
  const signedIn = Boolean(authorized && userMeta);
  const lastSignedIn = useRef<boolean | null>(null);

  // The host tells the plugins which app they run in (frontend or admin).
  setPluginAppScope(scope);

  useEffect(() => {
    if (!connected || !loaded) return;
    // First start: load once. Later login or logout: load again with the new roles.
    const changed = lastSignedIn.current !== null && lastSignedIn.current !== signedIn;
    lastSignedIn.current = signedIn;
    void (changed ? reloadActivePlugins(scope) : loadActivePlugins(scope));
  }, [connected, loaded, scope, signedIn]);

  return <>{children}</>;
};
