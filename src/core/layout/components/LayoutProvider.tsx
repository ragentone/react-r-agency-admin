import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { type ILayoutContext, LayoutContext } from './layout.context.ts';

interface IProps {
  children: ReactNode;
}

const LayoutProvider = (props: IProps) => {
  const [mounted, setMounted] = useState(false);

  const contextValue = useMemo<ILayoutContext>(
    () => ({
      mounted,
    }),
    [mounted]
  );

  useEffect(() => {
    const init = () => setMounted(true);
    init();
    return () => setMounted(false);
  }, []);

  return <LayoutContext.Provider value={contextValue}>{props.children}</LayoutContext.Provider>;
};

export { LayoutProvider };
