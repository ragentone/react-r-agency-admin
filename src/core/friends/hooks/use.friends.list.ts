import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { FriendsApi } from '../api';
import { FRIENDS_PAGE_SIZE, FRIENDS_RELOAD_DEBOUNCE_MS } from '../const';
import { useFriendsStore } from '../store';
import type { FriendsFilter, IFriendListItem } from '../types';
import { onFriendPresence, onFriendsChanged, removesFrom } from '../utils';

const toError = (err: unknown) => (err instanceof Error ? err : new Error(String(err)));

/**
 * Paged relation list of one filter.
 *
 * - Rows affected by a pending action are hidden right away (optimistic).
 * - After a relation change the row is dropped locally and the list reloads in the background
 *   (debounced, without skeleton / dimming, keeping the pages loaded so far).
 *
 * @param filter
 * @param enabled
 * @param initialDelayMs Wait this long before the first request (skeleton stays visible).
 */
export const useFriendsList = (filter: FriendsFilter, enabled = true, initialDelayMs = 0) => {
  const [items, setItems] = useState<IFriendListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(false);
  const request = useRef(0);
  /**
   * Raw rows consumed so far (`offset` of the next page). Not `items.length`: the backend skips
   * relations whose user no longer exists, but still counts them in `total` – paging by
   * `items.length` would request the same page forever.
   */
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const moveOffset = (next: number) => {
    offsetRef.current = next;
    setOffset(next);
  };
  const itemsRef = useRef(items);
  useLayoutEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const pending = useFriendsStore(state => state.pending);

  // Filter switched → start fresh.
  const [forFilter, setForFilter] = useState(filter);
  if (forFilter !== filter) {
    setForFilter(filter);
    setItems([]);
    setTotal(0);
    setOffset(0);
    setLoaded(false);
    setError(null);
  }

  /**
   * @param silent Background refresh: no loading state, reloads as many rows as are loaded now.
   */
  const reload = useCallback(
    async (delayMs = 0, silent = false) => {
      const id = ++request.current;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        if (delayMs > 0) {
          await new Promise(resolve => window.setTimeout(resolve, delayMs));
          if (id !== request.current) return;
        }
        const want = silent
          ? Math.max(itemsRef.current.length, FRIENDS_PAGE_SIZE)
          : FRIENDS_PAGE_SIZE;
        let next: IFriendListItem[] = [];
        let nextTotal = 0;
        let nextOffset = 0;
        do {
          const result = await FriendsApi.list(filter, FRIENDS_PAGE_SIZE, nextOffset);
          if (id !== request.current) return; // a newer request won
          next = next.concat(result.items);
          nextTotal = result.total;
          nextOffset += FRIENDS_PAGE_SIZE;
        } while (next.length < want && nextOffset < nextTotal);
        const seen = new Set<string>();
        setItems(
          next.filter(item => {
            if (seen.has(item.relation.relationId)) return false;
            seen.add(item.relation.relationId);
            return true;
          })
        );
        setTotal(nextTotal);
        moveOffset(nextOffset);
        setError(null);
      } catch (err) {
        if (id === request.current && !silent) setError(toError(err));
      } finally {
        if (id === request.current) {
          setLoading(false);
          setLoaded(true);
        }
      }
    },
    [filter]
  );

  const loadMore = useCallback(async () => {
    const from = offsetRef.current;
    if (loading || loadingMore || from >= total) return;
    const id = request.current;
    setLoadingMore(true);
    try {
      const result = await FriendsApi.list(filter, FRIENDS_PAGE_SIZE, from);
      if (id !== request.current) return;
      moveOffset(from + FRIENDS_PAGE_SIZE);
      setItems(prev => {
        const known = new Set(prev.map(item => item.relation.relationId));
        return [...prev, ...result.items.filter(item => !known.has(item.relation.relationId))];
      });
      setTotal(result.total);
      setError(null);
    } catch (err) {
      setError(toError(err));
    } finally {
      setLoadingMore(false);
    }
  }, [filter, loading, loadingMore, total]);

  useEffect(() => {
    if (!enabled) return;
    queueMicrotask(() => void reload(initialDelayMs));
    // Delay only for the first load of this list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload]);

  useEffect(() => {
    if (!enabled) return;
    let timer = 0;
    const off = onFriendsChanged(({ userId, action }) => {
      if (userId && removesFrom(action, filter)) {
        if (itemsRef.current.some(item => item.id === userId)) {
          setItems(prev => prev.filter(item => item.id !== userId));
          setTotal(count => Math.max(0, count - 1));
        }
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void reload(0, true), FRIENDS_RELOAD_DEBOUNCE_MS);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, [enabled, filter, reload]);

  // Live online state – only the dot changes, no reload.
  useEffect(() => {
    if (!enabled) return;
    return onFriendPresence(({ userId, online }) => {
      if (!itemsRef.current.some(item => item.id === userId && !!item.online !== online)) return;
      setItems(prev => prev.map(item => (item.id === userId ? { ...item, online } : item)));
    });
  }, [enabled]);

  // Optimistic view: hide rows whose pending action takes them out of this list.
  const visible = useMemo(
    () => items.filter(item => !removesFrom(pending[item.id], filter)),
    [filter, items, pending]
  );
  const hidden = items.length - visible.length;
  const hasMore = offset < total;
  // Everything loaded → the real number (backend `total` also counts relations of deleted users).
  const known = hasMore ? total : items.length;

  return {
    items: visible,
    total: Math.max(0, known - hidden),
    loading,
    loadingMore,
    loaded,
    error,
    hasMore,
    reload,
    loadMore,
  };
};
