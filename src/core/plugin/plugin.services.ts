import type {
  IPluginServices,
  PluginServiceInput,
  PluginServiceName,
  PluginServiceOutput,
} from './plugin.service';
import type { IPluginRequestResult, PluginCapability } from './plugin.types';

/**
 * Registry of host services for `api.host.call`. Names and types come from `IPluginServices`
 * (plugin.service.d.ts), so registering a service with the wrong shape is a type error.
 * Plugins get plain data back, never references to host objects.
 */
type ServiceDef<K extends PluginServiceName> = {
  capability: IPluginServices[K]['capability'];
  run: (input: IPluginServices[K]['input']) => IPluginServices[K]['output'];
};

interface IRegisteredService {
  capability: PluginCapability | null;
  run: (input: unknown) => unknown;
}

const SERVICES = new Map<string, IRegisteredService>();

/** Registers the implementation of a service. A second registration of the same name replaces the first. */
export const registerPluginService = <K extends PluginServiceName>(
  name: K,
  def: ServiceDef<K>
): void => {
  if (SERVICES.has(name))
    console.warn(`[plugin host] service "${name}" registered twice, the later one wins`);
  SERVICES.set(name, def as unknown as IRegisteredService);
};

/** `grants` = capabilities from plugin.json, `null` = no list (everything allowed). Never throws. */
export const callPluginService = <K extends string>(
  grants: PluginCapability[] | null,
  name: K,
  input?: PluginServiceInput<K>
): IPluginRequestResult<PluginServiceOutput<K>> => {
  const service = SERVICES.get(name);
  if (!service) return { ok: false, data: null, error: 'unknown_service' };
  if (service.capability && grants !== null && !grants.includes(service.capability)) {
    return { ok: false, data: null, error: 'not_granted' };
  }
  try {
    return { ok: true, data: service.run(input) as PluginServiceOutput<K>, error: null };
  } catch (error) {
    console.error(`[plugin host] service "${name}"`, (error as Error)?.message ?? error);
    return { ok: false, data: null, error: 'service_error' };
  }
};

// Built-in services

registerPluginService('route.current', {
  capability: null,
  run: () => ({
    pathname: window.location.pathname,
    search: Object.fromEntries(new URLSearchParams(window.location.search)),
  }),
});

registerPluginService('viewport.current', {
  capability: null,
  run: () => ({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
  }),
});

registerPluginService('theme.current', {
  capability: null,
  run: () => ({ mode: document.documentElement.classList.contains('dark') ? 'dark' : 'light' }),
});

registerPluginService('app.reload', {
  run: () => window.location.reload(),
  capability: 'navigate',
});
