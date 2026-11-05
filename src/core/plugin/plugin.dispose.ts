/**
 * Cleanup functions a plugin registers with `api.onDispose`. The host runs them when the plugin
 * is unloaded, before a hot reload and when it is removed. Each function runs once.
 */
const disposers = new Map<string, Set<() => void>>();

export const addPluginDisposer = (pluginId: string, fn: () => void): (() => void) => {
  const set = disposers.get(pluginId) ?? new Set<() => void>();
  set.add(fn);
  disposers.set(pluginId, set);
  return () => {
    set.delete(fn);
  };
};

/** Runs and forgets all cleanup functions of a plugin. A failing one is logged, the others still run. */
export const runPluginDisposers = (pluginId: string): void => {
  const set = disposers.get(pluginId);
  if (!set) return;
  disposers.delete(pluginId);
  for (const fn of set) {
    try {
      fn();
    } catch (error) {
      console.error(`[plugin:${pluginId}] onDispose`, (error as Error)?.message ?? error);
    }
  }
};
