import type { ExtensionComponent } from '@core/extension';
import { useGraphQlGetter } from '@core/mesh';
import { useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { type ISeoConfigResult, SeoConfigQuery } from '../api';
import { applySeoHead } from '../head';
import { normalizePath, resolveSeoHead } from '../resolve';
import { onSeoConfigRefresh, useSeoStore } from '../store';

type Query = Parameters<ReturnType<ReturnType<typeof useGraphQlGetter>>['query']>[0]['query'];

/**
 * Global extension (renders nothing): keeps `<head>` in sync with the page – title, description,
 * canonical, robots, Open Graph / X cards and JSON-LD. Data: runtime `seoConfig` (admin:
 * `/admin/seo`), the route title and `useSeo()` of the page.
 */
export const SeoManager: ExtensionComponent = () => {
  const getGraphql = useGraphQlGetter();
  const { i18n } = useTranslation();
  const config = useSeoStore(store => store.config);
  const page = useSeoStore(store => store.page);
  // Resolved location: `beforeLoad` (route title) has run, the page is on screen.
  const pathname = useRouterState({
    select: state => (state.resolvedLocation ?? state.location).pathname,
  });
  const routeTitle = useRouterState({
    select: state => state.matches.at(-1)?.staticData?.meta?.title,
  });

  useEffect(() => {
    let request = 0;
    const load = async () => {
      const id = ++request;
      try {
        const response = (await getGraphql().query({
          query: SeoConfigQuery as Query,
          fetchPolicy: 'no-cache',
        })) as { data?: { seoConfig?: ISeoConfigResult } };
        const result = response.data?.seoConfig;
        if (id === request && result?.success && result.settings) {
          useSeoStore.getState().setConfig({
            settings: result.settings,
            routes: Array.isArray(result.routes) ? result.routes : [],
          });
        }
      } catch {
        /* head keeps route titles – next refresh tries again */
      }
    };
    void load();
    const off = onSeoConfigRefresh(() => void load());
    return () => {
      request += 1;
      off();
    };
  }, [getGraphql]);

  useEffect(() => {
    const path = normalizePath(pathname);
    applySeoHead(
      resolveSeoHead({
        config,
        pathname: path,
        routeTitle,
        page: page?.path === path ? page.meta : null,
        locale: i18n.language || 'de',
      })
    );
  }, [config, page, pathname, routeTitle, i18n.language]);

  return null;
};
