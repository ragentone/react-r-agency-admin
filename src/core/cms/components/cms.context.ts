import type { CmsItemPosition, CmsItemsCollection, ICmsRegisteredItem } from '@core/cms/types.ts';
import type { ICmsContainerRegister } from 'cms/global';
import { createContext } from 'react';

export interface ICmsContext {
  collection: CmsItemsCollection;
  getItems<Key extends keyof ICmsContainerRegister>(
    key: Key,
    position?: CmsItemPosition
  ): ICmsRegisteredItem[];
}

export const CmsContext = createContext<ICmsContext | undefined>(undefined);
