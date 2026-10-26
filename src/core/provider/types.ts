import type { ProviderConfig } from '../components';

export type ProviderTarget = 'root' | 'route';

export interface ICustomProviderProps {
  target?: ProviderTarget;
  config: ProviderConfig;
  sortOrder: number;
  alias: string;
}

export interface ICustomProvider {
  target: ProviderTarget;
  config: ProviderConfig;
  sortOrder: number;
  alias: string;
}

export interface IProviderManager {
  add(props: ICustomProviderProps): void;
  export(target: ProviderTarget): ProviderConfig[];
  merge(providers: ProviderConfig[], withTarget: ProviderTarget): ProviderConfig[];
}
