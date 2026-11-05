/** Event bus between plugins. A plugin sends `<id>.<name>` events and receives the ones it listens for. */

export interface IPluginEventMeta {
  /** Plugin id of the sender. */
  from: string;
  name: string;
}

type PluginEventHandler = (payload: unknown, meta: IPluginEventMeta) => void | Promise<void>;

interface IPluginEventSubscription {
  pluginId: string;
  handler: PluginEventHandler;
}

const subscribers = new Map<string, Set<IPluginEventSubscription>>();

export const subscribePluginEvent = (
  pluginId: string,
  name: string,
  handler: PluginEventHandler
): (() => void) => {
  const entry: IPluginEventSubscription = { pluginId, handler };
  const set = subscribers.get(name) ?? new Set<IPluginEventSubscription>();
  set.add(entry);
  subscribers.set(name, set);
  return () => {
    set.delete(entry);
  };
};

/** Delivers asynchronously: the sender does not wait, and a failing listener does not affect the sender. */
export const emitPluginEvent = (from: string, name: string, payload: unknown): void => {
  const set = subscribers.get(name);
  if (!set) return;
  for (const entry of [...set]) {
    void Promise.resolve()
      .then(() => entry.handler(payload, { from, name }))
      .catch(error => {
        console.error(`[plugin:${entry.pluginId}] event "${name}"`, (error as Error)?.message ?? error);
      });
  }
};

/** Removes all subscriptions of a plugin (on unload and before a hot reload). */
export const clearPluginEvents = (pluginId: string): void => {
  for (const set of subscribers.values()) {
    for (const entry of [...set]) {
      if (entry.pluginId === pluginId) set.delete(entry);
    }
  }
};
