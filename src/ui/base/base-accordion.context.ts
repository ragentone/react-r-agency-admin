import { createContext } from 'react';

import type { IBaseAccordionItem } from './BaseAccordion.tsx';

export interface IBaseAccordionContextInt {
  items: IBaseAccordionItem[];
  values: string[];
  setValues: (values: string[]) => void;
}

export interface IBaseAccordionContext extends IBaseAccordionContextInt {
  mounted: boolean;
  asCard: boolean;
}

/** Own module so a hot reload of `BaseAccordion.tsx` keeps the same context object. */
export const BaseAccordionContext = createContext<IBaseAccordionContext | undefined>(undefined);
