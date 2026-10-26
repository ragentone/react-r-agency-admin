import { createContext } from 'react';

export interface IExtensionProviderContext {
  mounted: boolean;
}

export const ExtensionContext = createContext<IExtensionProviderContext | undefined>(undefined);
