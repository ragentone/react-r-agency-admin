import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useRef, useState } from 'react';

import { ADMIN_SEARCH_LIMIT, ADMIN_SEARCH_MIN } from '../const';
import { AdminUserSearchQuery } from '../graphql';
import type { IAdminUser } from '../types';
import { type QueryDocument, toError } from './graphql.client';

interface ISearchResponse {
  data?: { adminUserSearch?: { success?: boolean; total?: number; users?: IAdminUser[] } };
}

/**
 * User search (alias / e-mail / id) with "load more".
 * Nothing is loaded up front – a term shorter than `ADMIN_SEARCH_MIN` clears the result.
 */
export const useAdminUsers = () => {
  const getGraphql = useGraphQlGetter();
  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Only the latest request may write (fast typing → out-of-order responses).
  const request = useRef(0);

  const fetchPage = useCallback(
    async (nextTerm: string, offset: number) => {
      const id = ++request.current;
      setLoading(true);
      setError(null);
      try {
        const response = (await getGraphql().query({
          query: AdminUserSearchQuery as QueryDocument,
          variables: { term: nextTerm, limit: ADMIN_SEARCH_LIMIT, offset },
          fetchPolicy: 'no-cache',
        })) as ISearchResponse;
        if (id !== request.current) return;
        const result = response.data?.adminUserSearch;
        if (!result?.success) throw new Error('adminUserSearch failed');
        const page = result.users ?? [];
        setUsers(prev => (offset === 0 ? page : [...prev, ...page]));
        setTotal(result.total ?? 0);
        setTerm(nextTerm);
      } catch (err) {
        if (id === request.current) setError(toError(err));
      } finally {
        if (id === request.current) {
          setLoading(false);
          setLoaded(true);
        }
      }
    },
    [getGraphql]
  );

  const search = useCallback(
    async (nextTerm: string) => {
      const trimmed = nextTerm.trim();
      if (trimmed.length < ADMIN_SEARCH_MIN) {
        request.current += 1; // drops a pending response
        setUsers([]);
        setTotal(0);
        setTerm('');
        setError(null);
        setLoading(false);
        setLoaded(false);
        return;
      }
      await fetchPage(trimmed, 0);
    },
    [fetchPage]
  );
  const loadMore = useCallback(
    () => fetchPage(term, users.length),
    [fetchPage, term, users.length]
  );

  /** After a role change: replace the user in the list. */
  const replace = useCallback((user: IAdminUser) => {
    setUsers(prev => prev.map(item => (item.id === user.id ? user : item)));
  }, []);

  return {
    users,
    total,
    term,
    loading,
    loaded,
    error,
    hasMore: users.length < total,
    search,
    loadMore,
    replace,
  };
};
