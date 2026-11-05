import type { IPluginApi, PluginCapability } from './plugin.types';

/**
 * API methods each capability unlocks. Without the capability a method is replaced by a stub:
 * it warns in the console and does nothing (`confirm` resolves `false`, `useUser` reports a guest).
 * This is a contract, not a security boundary: plugins run in the same origin as the app.
 */
const CAPABILITY_METHODS: Record<PluginCapability, (keyof IPluginApi)[]> = {
  drawer: ['openDrawer'],
  confirm: ['confirm'],
  navigate: ['navigate'],
  toast: ['toast'],
  user: ['useUser', 'usePlatform'],
};

const GUEST = { status: 'guest', loggedIn: false, user: null, can: () => false };

const stubFor = (pluginId: string, cap: PluginCapability, key: keyof IPluginApi): unknown => {
  if (key === 'confirm') return async () => false;
  if (key === 'useUser') return () => GUEST;
  if (key === 'usePlatform') return () => 'web';
  return () => {
    console.warn(`[plugin:${pluginId}] "${String(key)}" needs capability "${cap}" in plugin.json`);
  };
};

/** `null` = plugin without a capability list: the API is returned unchanged. */
export const withCapabilities = (
  pluginId: string,
  api: IPluginApi,
  capabilities: PluginCapability[] | null
): IPluginApi => {
  if (capabilities === null) return api;
  const granted = new Set<string>(capabilities);
  const result: Record<string, unknown> = { ...(api as unknown as Record<string, unknown>) };
  for (const cap of Object.keys(CAPABILITY_METHODS) as PluginCapability[]) {
    if (granted.has(cap)) continue;
    for (const key of CAPABILITY_METHODS[cap]) {
      result[key] = stubFor(pluginId, cap, key);
    }
  }
  return result as unknown as IPluginApi;
};
