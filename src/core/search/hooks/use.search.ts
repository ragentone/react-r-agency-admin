import { useEffect, useRef, useState } from 'react';

import { SearchApi } from '../api';
import { SEARCH_DEBOUNCE_MS, SEARCH_LIMIT, SEARCH_MIN_LENGTH } from '../const';
import type { ISearchResult } from '../types';

/** Results survive closing the dialog → reopening shows them instantly (no new request). */
const RESULT_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { result: ISearchResult; at: number }>();
const cached = (key: string) => {
  const hit = cache.get(key);
  return hit && Date.now() - hit.at < RESULT_TTL_MS ? hit.result : null;
};

/** Debounced search over the selected bundles; older responses never overwrite newer ones. */
export const useSearch = (term: string, bundles: string[]) => {
  const query = term.trim();
  const active = query.length >= SEARCH_MIN_LENGTH && bundles.length > 0;
  const key = `${query}|${bundles.join(',')}`;

  const [result, setResult] = useState<ISearchResult | null>(() => cached(key));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchedKey, setSearchedKey] = useState(() => (cached(key) ? key : ''));
  const request = useRef(0);

  useEffect(() => {
    const id = ++request.current;
    if (!active) return;
    const hit = cached(key);
    if (hit) {
      queueMicrotask(() => {
        if (id !== request.current) return;
        setResult(hit);
        setSearchedKey(key);
      });
      return;
    }
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const next = await SearchApi.search(query, bundles, SEARCH_LIMIT);
        if (id !== request.current) return;
        cache.set(key, { result: next, at: Date.now() });
        setResult(next);
        setSearchedKey(key);
      } catch (err) {
        if (id === request.current) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (id === request.current) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // `key` covers query + bundles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, key]);

  return {
    active,
    result: active ? result : null,
    /** Typing (debounce) or request running. */
    loading: active && (loading || searchedKey !== key),
    /** Result belongs to an older term (shown dimmed while the new one loads). */
    stale: active && searchedKey !== key,
    error: active ? error : null,
  };
};
