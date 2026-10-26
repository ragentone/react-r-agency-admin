import { lazyComponent } from '@core/utils/lazy.component.ts';
import { type ComponentType, createElement } from 'react';

import { PageLoading } from './PageLoading.tsx';

/**
 * A page that is loaded on demand (own chunk) – keeps it out of the start bundle.
 * Shows `PageLoading` while the chunk loads.
 *
 * @example Core.page.setPage('account', lazyPage(() => import('./PageAccount.tsx').then(m => m.PageAccount), 'PageAccount'));
 */

export const lazyPage = <P extends object = any>(
  loader: () => Promise<ComponentType<P>>,
  name?: string
) => lazyComponent<P>(loader, { fallback: createElement(PageLoading), name });
