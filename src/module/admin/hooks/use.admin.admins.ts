import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useRef, useState } from 'react';

import { ADMIN_LIST_LIMIT } from '../const';
import { AdminAdminListQuery } from '../graphql';
import type { IAdminUser } from '../types';
import { type QueryDocument, toError } from './graphql.client';

interface IListResponse {
  data?: { adminAdminList?: { success?: boolean; total?: number; users?: IAdminUser[] } };
}

/** All admin accounts (`super:admin:user` only), `ADMIN_LIST_LIMIT` per page, appended on scroll. */
export const useAdminAdmins = () => {
  const getGraphql = useGraphQlGetter();
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Guards against double requests (the sentinel fires again while a page is loading).
  const busy = useRef(false);
  const count = useRef(0);

  const fetchPage = useCallback(
    async (offset: number) => {
      if (busy.current) return;
      busy.current = true;
      setLoading(true);
      setError(null);
      try {
        const response = (await getGraphql().query({
          query: AdminAdminListQuery as QueryDocument,
          variables: { limit: ADMIN_LIST_LIMIT, offset },
          fetchPolicy: 'no-cache',
        })) as IListResponse;
        const result = response.data?.adminAdminList;
        if (!result?.success) throw new Error('adminAdminList failed');
        const page = result.users ?? [];
        count.current = offset === 0 ? page.length : count.current + page.length;
        setUsers(prev => (offset === 0 ? page : [...prev, ...page]));
        setTotal(result.total ?? 0);
      } catch (err) {
        setError(toError(err));
      } finally {
        busy.current = false;
        setLoading(false);
        setLoaded(true);
      }
    },
    [getGraphql]
  );

  const reload = useCallback(() => fetchPage(0), [fetchPage]);
  const loadMore = useCallback(() => fetchPage(count.current), [fetchPage]);
  const replace = useCallback((user: IAdminUser) => {
    setUsers(prev => prev.map(item => (item.id === user.id ? user : item)));
  }, []);

  /** After a delete: the admin leaves the list. */
  const remove = useCallback((id: string) => {
    count.current = Math.max(count.current - 1, 0);
    setUsers(prev => prev.filter(item => item.id !== id));
    setTotal(prev => Math.max(prev - 1, 0));
  }, []);

  return {
    users,
    total,
    loading,
    loaded,
    error,
    // After an error no endless retry loop – the retry button reloads.
    hasMore: !error && users.length < total,
    reload,
    loadMore,
    replace,
    remove,
  };
};
