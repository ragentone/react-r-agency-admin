import type { IPluginHookOptions, PluginHookName } from './plugin.types';

/**
 * The admin has no host events yet (login, navigation, slot mounts). Hook subscriptions are accepted
 * and ignored, so plugins keep working without errors. Connect them here once the admin emits events.
 */
export const addPluginHook = (
  pluginId: string,
  name: PluginHookName,
  _handler: (event: never) => void | Promise<void>,
  _options?: IPluginHookOptions
): (() => void) => {
  console.warn(`[plugin:${pluginId}] hook "${name}" is not emitted in the admin yet`);
  return () => undefined;
};

/** Removes every hook of a plugin. Nothing is subscribed in the admin, so nothing to remove. */
export const clearPluginHooks = (_pluginId: string) => undefined;
