import { useGraphQlGetter } from '@core/mesh';
import { useEffect, useState } from 'react';

import { SitePageDisplayModeQuery } from '../graphql';
import type { SitePageDisplayMode } from '../types';
import type { QueryDocument } from './graphql.client';

/**
 * Display mode of a page, read before the page is rendered (`sitePageDisplayMode`).
 * `null` while unknown. Any failure falls back to `route`, so the page shows its own state there.
 */
export const useSitePageDisplayMode = (slug: string): SitePageDisplayMode | null => {
  const getGraphql = useGraphQlGetter();
  const [mode, setMode] = useState<SitePageDisplayMode | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = (await getGraphql().query({
          query: SitePageDisplayModeQuery as QueryDocument,
          variables: { slug },
          fetchPolicy: 'no-cache',
          errorPolicy: 'all',
        })) as { data?: { sitePageDisplayMode?: { displayMode?: string | null } } };
        const value = response.data?.sitePageDisplayMode?.displayMode;
        if (alive) setMode(value === 'fullscreen' ? 'fullscreen' : 'route');
      } catch {
        if (alive) setMode('route');
      }
    })();
    return () => {
      alive = false;
    };
  }, [getGraphql, slug]);

  return mode;
};
