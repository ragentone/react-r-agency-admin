import type { ICmsContainerRegister } from 'cms/global';
import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { CmsManager } from '../cms.manager.ts';
import {
  type CmsItemPosition,
  type CmsItemsCollection,
  type ICmsRegisteredItem,
} from '../types.ts';
import { CmsContext, type ICmsContext } from './cms.context.ts';

interface IProps {
  children: ReactNode;
}

const CmsProvider = ({ children }: IProps) => {
  const [collection] = useState<CmsItemsCollection>(CmsManager.collection);

  const getItems = useCallback(
    <Key extends keyof ICmsContainerRegister>(
      key: Key,
      position?: CmsItemPosition
    ): ICmsRegisteredItem[] => {
      return (collection[key] ?? [])
        .filter(item => !item.disabled)
        .filter(item => item.position === position)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    [collection]
  );

  const contextValue = useMemo<ICmsContext>(() => {
    return {
      collection,
      getItems,
    };
  }, [collection, getItems]);
  return <CmsContext.Provider value={contextValue}>{children}</CmsContext.Provider>;
};

export { CmsProvider };
