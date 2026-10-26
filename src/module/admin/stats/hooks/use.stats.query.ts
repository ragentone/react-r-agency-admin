import { useCallback, useEffect, useState } from 'react';

import type { IStatsResult } from '../api';

interface IState<D> {
  /** `key|tick` of the request this state belongs to. */
  id: string;
  data: D | null;
  error: boolean;
}

/**
 * Loads one statistics result, reloads when `key` changes and – with `pollMs` – every
 * `pollMs` while the page is visible (live tab). Keeps the last data while reloading.
 * `load` / `pick` are read when `key` or the reload counter changes (`key` must describe them).
 */
export const useStatsQuery = <R extends IStatsResult, D>(
  load: () => Promise<R>,
  pick: (result: R) => D | undefined,
  key: string,
  pollMs = 0
) => {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<IState<D>>({ id: '', data: null, error: false });
  const id = `${key}|${tick}`;

  useEffect(() => {
    let cancelled = false;
    void load().then(result => {
      if (cancelled) return;
      const value = result.success ? pick(result) : undefined;
      setState(previous =>
        value !== undefined
          ? { id, data: value, error: false }
          : { id, data: previous.data, error: true }
      );
    });
    return () => {
      cancelled = true;
    };
    // `key` + `tick` describe the request; `load` / `pick` are new closures on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reload = useCallback(() => setTick(value => value + 1), []);

  useEffect(() => {
    if (!pollMs) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') reload();
    }, pollMs);
    const onVisible = () => {
      if (document.visibilityState === 'visible') reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pollMs, reload]);

  const sameKey = state.id.startsWith(`${key}|`);
  const data = sameKey || pollMs ? state.data : null;
  const pending = state.id !== id;
  return {
    data,
    loading: pending && !data,
    refreshing: pending && Boolean(data),
    error: !pending && state.error && !data,
    reload,
  };
};
