import { type ReactNode, useEffect, useMemo, useState } from 'react';

import type { IExtensionContext } from '../types.ts';
import { ExtensionContext, type IExtensionProviderContext } from './extension.context.ts';

interface IProps {
  children: () => ReactNode;
  context: IExtensionContext;
}

const ExtensionProvider = (props: IProps) => {
  const [mounted, setMounted] = useState(false);

  const contextValue = useMemo<IExtensionProviderContext>(() => {
    return {
      mounted,
    };
  }, [mounted]);

  useEffect(() => {
    const init = () => {
      setMounted(true);
    };
    init();

    return () => {
      setMounted(false);
    };
  }, []);

  return (
    <ExtensionContext.Provider value={contextValue}>{props.children()}</ExtensionContext.Provider>
  );
};

export { ExtensionProvider };
