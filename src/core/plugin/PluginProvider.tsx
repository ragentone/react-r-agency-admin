import { useAuth } from '@core/auth/components/use.auth.ts';
import { useMeshState } from '@core/mesh/components/use.mesh.ts';
import { type ReactNode, useEffect } from 'react';

import { setPluginAppScope } from './plugin.host';
import { loadActivePlugins } from './plugin.bootstrap';
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
  const { loaded } = useAuth();

  // The host tells the plugins which app they run in (frontend or admin).
  setPluginAppScope(scope);

  useEffect(() => {
    if (connected && loaded) void loadActivePlugins(scope);
  }, [connected, loaded, scope]);

  return <>{children}</>;
};
