import type { PluginCapability } from './plugin.types';

/**
 * Host services for `api.host.call(name, payload?)`. The keys drive the autocomplete.
 *
 * Other host modules add their services by declaration merging in their own `.d.ts` file
 * (the file needs an `export {}` so it counts as a module):
 *
 *   export {};
 *   declare module '@core/plugin/plugin.service' {
 *     interface IPluginServices {
 *       'cart.count': { capability: null; input: void; output: { count: number } };
 *     }
 *   }
 *
 * Then register the implementation once with `registerPluginService` (plugin.services.ts).
 * `capability`: the capability a plugin needs in plugin.json, `null` = always allowed.
 */
export interface IPluginServices {
  'route.current': {
    capability: null;
    input: void;
    output: { pathname: string; search: Record<string, string> };
  };
  'viewport.current': {
    capability: null;
    input: void;
    output: { width: number; height: number; isMobile: boolean };
  };
  'theme.current': {
    capability: null;
    input: void;
    output: { mode: 'light' | 'dark' };
  };
  'app.reload': {
    capability: 'navigate';
    input: void;
    output: void;
  };
}

export type PluginServiceName = keyof IPluginServices;

/**
 * Known names get autocomplete and typed payload/result. Any other string is accepted by the compiler
 * too: at runtime it answers `unknown_service` unless a module registers it.
 */
export type PluginServiceNameAny = PluginServiceName | (string & {});

export type PluginServiceInput<K extends string> = K extends keyof IPluginServices
  ? IPluginServices[K]['input']
  : unknown;

export type PluginServiceOutput<K extends string> = K extends keyof IPluginServices
  ? IPluginServices[K]['output']
  : unknown;

/** Capability type used by services, re-exported for module augmentations. */
export type PluginServiceCapability = PluginCapability | null;
