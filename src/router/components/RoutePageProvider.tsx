import type { IRouterPageProps } from '@router/components';
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface IRouterPageContext {
  mounted: boolean;
  props: IRouterPageProps;
  loaded(): void;
}

const Context = createContext<IRouterPageContext | undefined>(undefined);

interface IProps {
  children: (context: IRouterPageContext) => ReactNode;
  pageProps: IRouterPageProps;
}

const RoutePageProvider = ({ children, pageProps }: IProps) => {
  const [mounted, setMounted] = useState(false);
  const mountedDelayRef = useRef<number>(0);

  const loaded = useCallback(() => {
    setMounted(true);
  }, []);

  const contextValue = useMemo(() => {
    return {
      mounted,
      props: pageProps,
      loaded,
    };
  }, [loaded, mounted, pageProps]);

  useEffect(() => {
    const init = () => {
      clearTimeout(mountedDelayRef.current);
      if (!pageProps.async) {
        mountedDelayRef.current = setTimeout(() => {
          setMounted(true);
        }, pageProps.mountedDelay ?? 0);
      }
    };
    init();
    return () => {
      clearTimeout(mountedDelayRef.current);
      setMounted(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Context.Provider value={contextValue}>{children(contextValue)}</Context.Provider>;
};

export { RoutePageProvider };
