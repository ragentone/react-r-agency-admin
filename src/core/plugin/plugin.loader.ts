import { createPluginApi } from './plugin.host';
import { unregisterPlugin } from './plugin.slots';
import type { IPluginModule, IPluginRef } from './plugin.types';

/**
 * Imports a bundle and checks that it is a valid plugin module for `ref`. Throws with the
 * exact reason. Does not register anything.
 */
export const importPlugin = async (
  ref: IPluginRef,
  bundleUrl = ref.bundleUrl
): Promise<IPluginModule> => {
  const module = (await import(/* @vite-ignore */ bundleUrl)) as { default?: IPluginModule };
  const plugin = module.default;
  if (!plugin) throw new Error('plugin_module_invalid: no default export');
  if (plugin.id !== ref.id) {
    throw new Error(`plugin_module_invalid: id "${String(plugin.id)}", expected "${ref.id}"`);
  }
  if (typeof plugin.register !== 'function') {
    throw new Error('plugin_module_invalid: register() missing (old bundle version?)');
  }
  return plugin;
};

/**
 * Loads one plugin bundle and calls its `register`. A bundle that fails to load or
 * register is removed again, the rest of the app keeps working.
 */
export const loadPlugin = async (ref: IPluginRef): Promise<boolean> => {
  try {
    const plugin = await importPlugin(ref);
    plugin.register(
      createPluginApi(
        ref.id,
        ref.slots,
        ref.assetBaseUrl,
        ref.pages,
        ref.intervene,
        ref.config ?? {},

        { emits: ref.emits, listens: ref.listens, capabilities: ref.capabilities, live: ref.live }
      )
    );
    return true;
  } catch (error) {
    console.error(`[plugin:${ref.id}]`, (error as Error)?.message ?? error);
    unregisterPlugin(ref.id);
    return false;
  }
};

/** Loads all plugins in parallel. Returns how many loaded. */
export const loadPlugins = async (refs: IPluginRef[]): Promise<number> => {
  const results = await Promise.all(refs.map(loadPlugin));
  return results.filter(Boolean).length;
};
