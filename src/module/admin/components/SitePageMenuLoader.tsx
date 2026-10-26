import { useAuthStore } from '@core/auth/auth.store.tsx';
import type { ExtensionComponent } from '@core/extension';
import { useGraphQlGetter } from '@core/mesh';
import { useEffect } from 'react';

import { SitePageMenuQuery } from '../graphql';
import type { QueryDocument } from '../hooks/graphql.client';
import { onSitePageMenuRefresh, setSitePageMenu } from '../site-page.menu';
import type { ISitePageMenuItem } from '../types';

/**
 * Global extension (renders nothing): loads the published pages into the "Pages" group of the
 * main menu – on start, after login / logout (restricted pages) and whenever an admin saves /
 * deletes a page.
 */
export const SitePageMenuLoader: ExtensionComponent = () => {
  const getGraphql = useGraphQlGetter();
  const authorized = useAuthStore(store => store.authorized);
  const userMeta = useAuthStore(store => store.userMeta);

  useEffect(() => {
    let request = 0;
    const load = async () => {
      const id = ++request;
      try {
        const response = (await getGraphql().query({
          query: SitePageMenuQuery as QueryDocument,
          fetchPolicy: 'no-cache',
        })) as { data?: { sitePageMenu?: { success?: boolean; items?: ISitePageMenuItem[] } } };
        const result = response.data?.sitePageMenu;
        if (id === request && result?.success) setSitePageMenu(result.items ?? []);
      } catch {
        /* menu stays as it is – next refresh tries again */
      }
    };
    void load();
    const off = onSitePageMenuRefresh(() => void load());
    return () => {
      request += 1;
      off();
    };
  }, [getGraphql, authorized, userMeta]);

  return null;
};
