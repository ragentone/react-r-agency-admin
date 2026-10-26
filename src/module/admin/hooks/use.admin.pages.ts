import { useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import {
  AdminPageCreateMutation,
  AdminPageDeleteMutation,
  AdminPageGetQuery,
  AdminPageListQuery,
  AdminPageUpdateMutation,
} from '../graphql';
import { refreshSitePageMenu } from '../site-page.menu';
import type { ISitePage, ISitePageResult, ISitePageValues } from '../types';
import { errorKey, type MutationDocument, type QueryDocument, toError } from './graphql.client';

type PageResponse<K extends string> = {
  data?: { [key in K]?: { success?: boolean; page?: ISitePage | null } };
  errors?: unknown;
};

/** Newest change first (same as the backend). */
const sortPages = (pages: ISitePage[]) =>
  [...pages].sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));

/** List without content – the full page is only loaded when it is opened. */
const withoutContent = (page: ISitePage): ISitePage => ({ ...page, content: '', blocks: [] });

/** Dynamic pages: list, load one, create, update, delete (`admin:user`). */
export const useAdminPages = () => {
  const getGraphql = useGraphQlGetter();
  const [pages, setPages] = useState<ISitePage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await getGraphql().query({
        query: AdminPageListQuery as QueryDocument,
        fetchPolicy: 'no-cache',
      })) as { data?: { adminPageList?: { success?: boolean; pages?: ISitePage[] } } };
      const result = response.data?.adminPageList;
      if (!result?.success) throw new Error('adminPageList failed');
      setPages(sortPages(result.pages ?? []));
    } catch (err) {
      setError(toError(err));
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [getGraphql]);

  /** One page incl. content (for the editor). */
  const fetchOne = useCallback(
    async (id: string): Promise<ISitePageResult> => {
      try {
        const response = (await getGraphql().query({
          query: AdminPageGetQuery as QueryDocument,
          variables: { id },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })) as PageResponse<'adminPageGet'>;
        const result = response.data?.adminPageGet;
        if (!result?.success || !result.page) {
          return { ok: false, error: errorKey(response.errors, 'error.load') };
        }
        return { ok: true, page: result.page };
      } catch (err) {
        return { ok: false, error: errorKey(err, 'error.load') };
      }
    },
    [getGraphql]
  );

  const save = useCallback(
    async (id: string | null, values: ISitePageValues): Promise<ISitePageResult> => {
      setSaving(true);
      try {
        const field = id ? 'adminPageUpdate' : 'adminPageCreate';
        const response = (await getGraphql().mutate({
          mutation: (id ? AdminPageUpdateMutation : AdminPageCreateMutation) as MutationDocument,
          variables: id ? { id, values } : { values },
          errorPolicy: 'all',
        })) as PageResponse<typeof field>;
        const result = response.data?.[field];
        if (!result?.success || !result.page) {
          return { ok: false, error: errorKey(response.errors) };
        }
        const page = result.page;
        refreshSitePageMenu();
        setPages(prev =>
          sortPages([withoutContent(page), ...prev.filter(item => item.id !== page.id)])
        );
        return { ok: true, page };
      } catch (err) {
        return { ok: false, error: errorKey(err) };
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  const create = useCallback((values: ISitePageValues) => save(null, values), [save]);
  const update = useCallback((id: string, values: ISitePageValues) => save(id, values), [save]);

  const remove = useCallback(
    async (id: string): Promise<ISitePageResult> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: AdminPageDeleteMutation as MutationDocument,
          variables: { id },
          errorPolicy: 'all',
        })) as { data?: { adminPageDelete?: { success?: boolean } }; errors?: unknown };
        if (!response.data?.adminPageDelete?.success) {
          return { ok: false, error: errorKey(response.errors, 'error.delete') };
        }
        setPages(prev => prev.filter(page => page.id !== id));
        refreshSitePageMenu();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: errorKey(err, 'error.delete') };
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  return { pages, loading, loaded, saving, error, load, fetchOne, create, update, remove };
};
