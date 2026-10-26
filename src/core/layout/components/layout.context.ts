import { createContext } from 'react';

export interface ILayoutContext {
  mounted: boolean;
}

/** Layout context – own module so a hot reload of `LayoutProvider` keeps the same context. */
export const LayoutContext = createContext<ILayoutContext | undefined>(undefined);
