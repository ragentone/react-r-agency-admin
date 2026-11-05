/**
 * Event bus between plugins. A plugin sends `<id>.<name>` events and receives the ones it listens for.
 * Requests: the owner registers one handler per `<id>.<name>` (`api.handle`), another plugin asks with
 * `api.request` and gets an answer or an error code back. Requests never throw.
 */

export interface IPluginEventMeta {
  /** Plugin id of the sender. */
  from: string;
  name: string;
}

/** Result of `api.request`. `error`: `no_handler`, `timeout`, `handler_error`, `not_listening`. */
export interface IPluginRequestResult<T = unknown> {
  ok: boolean;
  data: T | null;
  error: string | null;
}

export type PluginEventHandler = (payload: unknown, meta: IPluginEventMeta) => void | Promise<void>;
export type PluginRequestHandler = (payload: unknown, meta: IPluginEventMeta) => unknown | Promise<unknown>;

/** Milliseconds a request may take before it fails with `timeout`. */
export const DEFAULT_REQUEST_TIMEOUT_MS = 2000;

interface IPluginEventSubscription {
  pluginId: string;
  handler: PluginEventHandler;
}

const subscribers = new Map<string, Set<IPluginEventSubscription>>();
const requestHandlers = new Map<string, { pluginId: string; handler: PluginRequestHandler }>();

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

/** Registers the handler for a request name. A later registration of the same name replaces it. */
export const registerPluginRequestHandler = (
  pluginId: string,
  name: string,
  handler: PluginRequestHandler
): (() => void) => {
  const entry = { pluginId, handler };
  requestHandlers.set(name, entry);
  return () => {
    if (requestHandlers.get(name) === entry) requestHandlers.delete(name);
  };
};

/** Asks the handler of `name`. Waits at most `timeoutMs`. Never throws. */
export const requestPluginEvent = async <T = unknown>(
  from: string,
  name: string,
  payload: unknown,
  timeoutMs: number = DEFAULT_REQUEST_TIMEOUT_MS
): Promise<IPluginRequestResult<T>> => {
  const entry = requestHandlers.get(name);
  if (!entry) return { ok: false, data: null, error: 'no_handler' };

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
  });
  try {
    const data = await Promise.race([
      Promise.resolve().then(() => entry.handler(payload, { from, name })),
      timeout,
    ]);
    return { ok: true, data: (data ?? null) as T | null, error: null };
  } catch (error) {
    const message = (error as Error)?.message;
    if (message === 'timeout') return { ok: false, data: null, error: 'timeout' };
    console.error(`[plugin:${entry.pluginId}] request "${name}"`, message ?? error);
    return { ok: false, data: null, error: 'handler_error' };
  } finally {
    clearTimeout(timer);
  }
};

/** Removes all request handlers of a plugin (on unload and before a hot reload). */
export const clearPluginRequestHandlers = (pluginId: string): void => {
  for (const [name, entry] of [...requestHandlers]) {
    if (entry.pluginId === pluginId) requestHandlers.delete(name);
  }
};
