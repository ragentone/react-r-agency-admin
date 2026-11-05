import { getMeshClient } from 'r-agency-mesh-client-v1/release';

/** Websocket channel of plugin live events. Event name: `<plugin-id>.<topic>`. */
const PLUGIN_LIVE_CHANNEL = 'plugins';

const unsubscribers = new Map<string, Array<() => void>>();

/**
 * Subscribes to one live topic of a plugin. The host only calls this for topics in `live` of the
 * plugin's plugin.json. Returns a function that removes the subscription.
 */
export const subscribePluginLive = (
  pluginId: string,
  topic: string,
  handler: (payload: unknown) => void
): (() => void) => {
  const channel = getMeshClient().websocket.channel<Record<string, unknown>>(PLUGIN_LIVE_CHANNEL);
  const off = channel.on(`${pluginId}.${topic}` as never, ({ payload }: { payload: unknown }) => handler(payload));
  const list = unsubscribers.get(pluginId) ?? [];
  list.push(off as () => void);
  unsubscribers.set(pluginId, list);
  return () => (off as () => void)();
};

/** Removes all live subscriptions of a plugin (on unload and before a hot reload). */
export const clearPluginLive = (pluginId: string): void => {
  for (const off of unsubscribers.get(pluginId) ?? []) off();
  unsubscribers.delete(pluginId);
};
