import type { ComponentType, FC, ReactNode } from 'react';

/**
 * Represents the configuration for a provider component.
 */
export type ProviderConfig<T extends object = object> = {
  provider: ComponentType<{ children: ReactNode } & T>;
  props?: T;
};

/**
 * Props for the ProviderComposer component, which is responsible for
 * composing multiple providers and injecting them into the component
 * tree.
 */
export interface ProviderComposerProps {
  children: ReactNode;
  providers: ProviderConfig[];
}

/**
 * A functional component that composes multiple context providers into a single hierarchy.
 * The `ProviderComposer` component takes a list of provider configurations and composes them
 * in reverse order, wrapping the `children` with the specified providers. This allows for
 * seamless management and layering of multiple React context providers.
 */
const ProviderComposer: FC<ProviderComposerProps> = ({ children, providers }) => {
  return providers.reduceRight((wrapped, providerConfig, index) => {
    const { provider: Provider, props = {} } = providerConfig;
    return (
      <Provider key={index} {...props}>
        {wrapped}
      </Provider>
    );
  }, children);
};

export { ProviderComposer };
