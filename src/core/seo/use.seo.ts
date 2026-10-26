import { useRouterState } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';

import { normalizePath } from './resolve';
import { useSeoStore } from './store';
import type { ISeoPageMeta } from './types';

/**
 * Page level meta data (title, description, image, dates, JSON-LD) – wins over the admin entry
 * of the path. Pass `null` while the data is loading. Example (dynamic page):
 * `useSeo(page ? { title: page.title, description: page.summary, type: 'article' } : null)`.
 */
export const useSeo = (meta: ISeoPageMeta | null) => {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const key = meta ? JSON.stringify(meta) : '';
  // `key` describes `meta` – a new object with the same content must not re-run the effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => meta, [key]);

  useEffect(() => {
    if (!stable) return;
    const owner = Symbol('seo-page');
    useSeoStore.setState({ page: { path: normalizePath(pathname), meta: stable, owner } });
    return () => {
      if (useSeoStore.getState().page?.owner === owner) useSeoStore.setState({ page: null });
    };
  }, [stable, pathname]);
};
