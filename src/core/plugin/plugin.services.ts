import type { IPluginRequestResult, PluginCapability } from './plugin.types';

/**
 * Host services a plugin calls with `api.host.call(name, payload)`. Plugins get plain data back,
 * never references to host objects. `capability` is the capability in plugin.json that the
 * service needs (`null` = always allowed). Without it the call returns `not_granted`.
 */
interface IPluginServiceDef {
  capability: PluginCapability | null;
  run: (payload: unknown) => unknown;
}

const SERVICES: Record<string, IPluginServiceDef> = {
  'route.current': {
    capability: null,
    run: () => ({
      pathname: window.location.pathname,
      search: Object.fromEntries(new URLSearchParams(window.location.search)),
    }),
  },
  'viewport.current': {
    capability: null,
    run: () => ({ width: window.innerWidth, height: window.innerHeight, isMobile: window.innerWidth < 768 }),
  },
  'theme.current': {
    capability: null,
    run: () => ({ mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light' }),
  },
};

export const PLUGIN_SERVICE_NAMES: string[] = Object.keys(SERVICES);

/** `grants` = capabilities from plugin.json, `null` = no list (everything allowed). Never throws. */
export const callPluginService = <T = unknown>(
  grants: PluginCapability[] | null,
  name: string,
  payload?: unknown
): IPluginRequestResult<T> => {
  const service = Object.prototype.hasOwnProperty.call(SERVICES, name) ? SERVICES[name] : undefined;
  if (!service) return { ok: false, data: null, error: 'unknown_service' };
  if (service.capability && grants !== null && !grants.includes(service.capability)) {
    return { ok: false, data: null, error: 'not_granted' };
  }
  try {
    return { ok: true, data: service.run(payload) as T, error: null };
  } catch (error) {
    console.error(`[plugin host] service "${name}"`, (error as Error)?.message ?? error);
    return { ok: false, data: null, error: 'service_error' };
  }
};
