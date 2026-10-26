import { useAuthStore } from '@core/auth/auth.store.tsx';
import { useGraphQlGetter } from '@core/mesh';
import { useEffect, useState } from 'react';

import { SitePageGetQuery } from '../graphql';
import type { ISitePage } from '../types';
import type { QueryDocument } from './graphql.client';

export type SitePageState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  /** Only for signed-in users – the visitor is a guest. */
  | { status: 'login' }
  /** Signed in, but without one of the required roles. */
  | { status: 'forbidden' }
  | { status: 'ready'; page: ISitePage };

/**
 * Public page by slug (`sitePageGet`) – `missing` for unknown slugs and foreign drafts.
 * Starts in `loading` – mount it with `key={slug}` so another slug starts fresh. Loads again
 * after login / logout / role changes (restricted pages).
 */
export const useSitePage = (slug: string) => {
  const getGraphql = useGraphQlGetter();
  const [state, setState] = useState<SitePageState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const authorized = useAuthStore(store => store.authorized);
  const userMeta = useAuthStore(store => store.userMeta);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = (await getGraphql().query({
          query: SitePageGetQuery as QueryDocument,
          variables: { slug },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })) as {
          data?: { sitePageGet?: { success?: boolean; page?: ISitePage | null } };
          errors?: unknown;
        };
        if (!alive) return;
        const result = response.data?.sitePageGet;
        if (result?.success && result.page) {
          setState({ status: 'ready', page: result.page });
        } else {
          const errors = JSON.stringify(response.errors ?? '');
          if (errors.includes('site_page_login_required')) setState({ status: 'login' });
          else if (errors.includes('site_page_forbidden')) setState({ status: 'forbidden' });
          else {
            const notFound = errors.includes('site_page_not_found');
            setState({ status: notFound || result ? 'missing' : 'error' });
          }
        }
      } catch {
        if (alive) setState({ status: 'error' });
      }
    })();
    return () => {
      alive = false;
    };
  }, [getGraphql, slug, attempt, authorized, userMeta]);

  const retry = () => {
    setState({ status: 'loading' });
    setAttempt(value => value + 1);
  };

  /** After an edit on the page itself. */
  const replace = (page: ISitePage) => setState({ status: 'ready', page });

  return { state, retry, replace };
};
