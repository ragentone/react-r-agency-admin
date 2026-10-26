import { sleep } from '@core/utils/sleep.tsx';
import {
  type ComponentType,
  createElement,
  type FunctionComponent,
  lazy,
  type ReactNode,
  Suspense,
} from 'react';

/**
 * Component that loads its implementation on first render (own chunk) and shows `fallback`
 * meanwhile. The Suspense boundary is included, so the result can be used anywhere –
 * also where it is called as a plain function (router `page`).
 *
 * @example const PageAccount = lazyComponent(() => import('./PageAccount.tsx').then(m => m.PageAccount));
 */
export function lazyComponent<P extends object>(
  loader: () => Promise<ComponentType<P>>,
  options: { fallback?: ReactNode; name?: string; delay?: number } = {}
): FunctionComponent<P> {
  const load = async () => {
    if (options.delay) {
      await sleep(options.delay);
    }
    return { default: await loader() };
  };

  const Lazy = lazy(load);
  const LazyComponent: FunctionComponent<P> = props =>
    createElement(Suspense, { fallback: options.fallback ?? null }, createElement(Lazy, props));
  // Stable name: used by the CMS / extension managers to replace registrations on hot reload.
  LazyComponent.displayName = options.name ?? 'LazyComponent';
  return LazyComponent;
}
