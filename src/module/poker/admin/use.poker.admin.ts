import { useCallback, useState } from 'react';

import { pokerAdminAction } from '../api.ts';
import type {
  IPokerAdminHandRow,
  IPokerAdminOverview,
  IPokerAdminResult,
  IPokerSettings,
} from '../types.ts';

/** Live overview – call `reload()` from an effect / interval. */
export const usePokerAdminOverview = () => {
  const [overview, setOverview] = useState<IPokerAdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    const result = await pokerAdminAction<IPokerAdminResult & { overview?: IPokerAdminOverview }>(
      'overview'
    );
    if (result.success && result.overview) {
      setOverview(result.overview);
      setError(null);
    } else setError(result.error ?? 'unknown');
  }, []);
  return { overview, error, reload };
};

/** Saved settings – call `reload()` on mount; `version` changes with every new copy. */
export const usePokerAdminSettings = () => {
  const [settings, setSettings] = useState<IPokerSettings | null>(null);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    const result = await pokerAdminAction<IPokerAdminResult & { settings?: IPokerSettings }>(
      'settings'
    );
    if (result.success && result.settings) {
      setSettings(result.settings);
      setVersion(value => value + 1);
      setError(null);
    } else setError(result.error ?? 'unknown');
  }, []);
  const replace = useCallback((next: IPokerSettings) => {
    setSettings(next);
    setVersion(value => value + 1);
  }, []);
  return { settings, version, error, reload, replace };
};

type HandsResult = IPokerAdminResult & {
  rows?: IPokerAdminHandRow[];
  hasMore?: boolean;
  userFound?: boolean;
};

/** Hand history page by page – call `load(0)` when the filter changes. */
export const usePokerAdminHands = (user: string, kind: 'all' | 'cash' | 'tournament') => {
  const [rows, setRows] = useState<IPokerAdminHandRow[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [userFound, setUserFound] = useState(true);
  const [loading, setLoading] = useState(false);
  const load = useCallback(
    async (offset: number) => {
      setLoading(true);
      const result = await pokerAdminAction<HandsResult>('hands', {
        offset,
        user: user || undefined,
        kind: kind === 'all' ? undefined : kind,
      });
      setLoading(false);
      if (!result.success) return;
      setRows(current =>
        offset ? [...(current ?? []), ...(result.rows ?? [])] : (result.rows ?? [])
      );
      setHasMore(!!result.hasMore);
      setUserFound(result.userFound !== false);
    },
    [user, kind]
  );
  return { rows, hasMore, userFound, loading, load };
};
