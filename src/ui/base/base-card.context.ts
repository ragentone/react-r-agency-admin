import { createContext } from 'react';

import type { IBaseCardProps } from './BaseCard.tsx';

export interface IBaseCardContext {
  mounted: boolean;
  cardProps: IBaseCardProps;
}

/** Own module so a hot reload of `BaseCard.tsx` keeps the same context object. */
export const BaseCardContext = createContext<IBaseCardContext | undefined>(undefined);
