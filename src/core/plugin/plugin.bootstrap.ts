import { useAuthTokenStore } from '@core/auth/auth.token.store.tsx';
import { useEffect, useState } from 'react';

import { watchPluginDev } from './plugin.hot';
import { loadPlugins } from './plugin.loader';
import {
  type IPluginRef,
  type PluginCapability,
  type PluginConfigPrimitive,
  type PluginScope,
  type PluginSlotName,
} from './plugin.types';

interface IPluginListItem {
  id: string;
  name: string;
  version: string;
  slots: string[];
  bundlePath: string;
  assetsPath: string;
  pages: string[];
  intervene: string[];
  emits?: string[];
  listens?: string[];
  capabilities?: string[] | null;
  live?: string[];
  /** Only outside production, for development plugins. */
  dev: { revisionPath: string; revision: string } | null;
  /** Public configuration values of the plugin. */
  config?: Record<string, PluginConfigPrimitive>;
}

const endpoint = () => String(import.meta.env.VITE_MESH_SERVER_ENDPOINT ?? '').replace(/\/+$/, '');

/** Same rule as the backend: dot-separated lowercase words, max. 64 characters. New slots need no change here. */
const SLOT_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/;
const isSlot = (value: string): value is PluginSlotName => value.length <= 64 && SLOT_PATTERN.test(value);

/** Public list of the active plugins (`GET /plugin`). Slots with an invalid name are dropped. */
export const fetchActivePlugins = async (scope: PluginScope = 'frontend'): Promise<IPluginRef[]> => {
  try {
    // With a token the backend also lists the plugins restricted to the user's roles.
    const token = useAuthTokenStore.getState().token;
    const response = await fetch(`${endpoint()}/plugin`, {
      headers: {
        ...(token ? { 'x-auth-token': token } : {}),
        // The backend answers with the plugins of this scope only; without the header it is `frontend`.
        ...(scope === 'admin' ? { 'x-mesh-app-scope': 'admin' } : {}),
      },
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { plugins?: IPluginListItem[] };
    return (body.plugins ?? []).map(plugin => ({
      id: plugin.id,
      slots: plugin.slots.filter(isSlot),
      bundleUrl: `${endpoint()}${plugin.bundlePath}`,
      assetBaseUrl: `${endpoint()}${plugin.assetsPath}`,
      pages: plugin.pages ?? [],
      intervene: plugin.intervene ?? [],
      emits: plugin.emits ?? [],
      listens: plugin.listens ?? [],
      capabilities: (plugin.capabilities ?? null) as PluginCapability[] | null,
      live: plugin.live ?? [],
      config: plugin.config ?? {},
      dev: plugin.dev
        ? { revisionUrl: `${endpoint()}${plugin.dev.revisionPath}`, revision: plugin.dev.revision }
        : undefined,
    }));
  } catch {
    return [];
  }
};

const started: Partial<Record<PluginScope, Promise<number>>> = {};

/**
 * Loads the active plugins once per page load. Later calls get the same promise, so it is
 * safe to call from every mount. Returns how many plugins loaded.
 */
export const loadActivePlugins = (scope: PluginScope = 'frontend'): Promise<number> => {
  if (!started[scope]) {
    started[scope] = fetchActivePlugins(scope).then(async refs => {
      const loaded = await loadPlugins(refs);
      // Dev plugins (outside production only) reload on every new dev build.
      refs.forEach(ref => ref.dev && watchPluginDev(ref));
      return loaded;
    });
  }
  return started[scope];
};

/** `true` once the active plugins are loaded. Wait for it before looking up a plugin page. */
export const usePluginsLoaded = (scope: PluginScope = 'frontend'): boolean => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    void loadActivePlugins(scope).then(() => {
      if (alive) setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [scope]);
  return loaded;
};
