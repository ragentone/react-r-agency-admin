import { useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';

import type { ISeoRoute } from './types';

/** Never offered as suggestion (admin, sign-in, codes …). */
const HIDDEN = /^\/(admin|auth|login|logout|user|accept|reject|dev)(\/|$)/;

/** Static routes of the app without an entry yet (no `$params`). */
export const useSeoSuggestions = (routes: ISeoRoute[]) => {
  const router = useRouter();
  return useMemo(() => {
    const taken = new Set(routes.map(route => route.path));
    const paths = Object.keys(router.routesByPath ?? {})
      .map(path => (path.length > 1 ? path.replace(/\/$/, '') : path))
      .filter(path => path.startsWith('/') && !path.includes('$') && !HIDDEN.test(path));
    return [...new Set(paths)]
      .filter(path => !taken.has(path))
      .sort()
      .slice(0, 12);
  }, [router, routes]);
};
