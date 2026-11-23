import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useEffect, useRef, useState } from 'react';

type Client = ReturnType<ReturnType<typeof useGraphQlGetter>>;
export type ShopQueryDoc = Parameters<Client['query']>[0]['query'];
export type ShopMutationDoc = Parameters<Client['mutate']>[0]['mutation'];

interface IState<T> {
  key: string;
  data: T;
  error: boolean;
}

/** Loads data; reloads whenever `key` changes (the key identifies the query variables). */
export const useShopQuery = <T>(
  fetcher: (client: Client) => Promise<T>,
  key: string,
  initial: T
) => {
  const getGraphql = useGraphQlGetter();
  const [state, setState] = useState<IState<T>>({ key: '', data: initial, error: false });
  const [version, setVersion] = useState(0);
  const fetchRef = useRef(fetcher);

  useEffect(() => {
    fetchRef.current = fetcher;
  });

  useEffect(() => {
    let cancelled = false;
    fetchRef
      .current(getGraphql())
      .then(data => !cancelled && setState({ key, data, error: false }))
      .catch(() => !cancelled && setState(prev => ({ ...prev, key, error: true })));
    return () => {
      cancelled = true;
    };
  }, [getGraphql, key, version]);

  const reload = useCallback(() => setVersion(v => v + 1), []);

  return { data: state.data, loading: state.key !== key, error: state.error, reload };
};
