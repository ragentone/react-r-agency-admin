import type { ProviderConfig } from '../components';
import type {
  ICustomProvider,
  ICustomProviderProps,
  IProviderManager,
  ProviderTarget,
} from './types.ts';

const __PROVIDERS__: ICustomProvider[] = [];
const __PROVIDERS_SET__: Set<string> = new Set();
/**
 * Manages a collection of custom providers and facilitates their configuration and export.
 */
const ProviderManager: IProviderManager = {
  /**
   * Adds a provider. Adding the same alias again replaces the existing entry
   * (a hot reload re-runs `core.tsx` / `app.tsx`).
   */
  add(props: ICustomProviderProps) {
    if (__PROVIDERS_SET__.has(props.alias)) {
      const index = __PROVIDERS__.findIndex(provider => provider.alias === props.alias);
      if (index >= 0) __PROVIDERS__.splice(index, 1);
    }
    __PROVIDERS__.push({
      alias: props.alias,
      config: props.config,
      sortOrder: props.sortOrder,
      target: props.target ?? 'root',
    });
    __PROVIDERS_SET__.add(props.alias);
  },
  /**
   * Exports an array of provider configurations, sorted by their sortOrder property.
   */
  export(target: ProviderTarget): ProviderConfig[] {
    if (__PROVIDERS__.length === 0) {
      return [];
    }
    const sorted = __PROVIDERS__
      .filter(provider => {
        return provider.target === target;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted.map(custom => custom.config);
  },
  /**
   * Merges the provided list of provider configurations with the exported provider configurations.
   */
  merge(providers: ProviderConfig[], withTarget: ProviderTarget): ProviderConfig[] {
    return [...providers, ...this.export(withTarget)];
  },
};

export { ProviderManager };
