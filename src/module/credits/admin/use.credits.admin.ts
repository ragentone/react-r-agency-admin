import { useCallback, useState } from 'react';

import { creditsAdminAction } from '../api.ts';
import type {
  CreditError,
  ICreditAdminOverview,
  ICreditAdminSettings,
  ICreditBankRow,
  ICreditChartDay,
  ICreditResult,
} from '../types.ts';

interface IOverviewResult extends ICreditResult {
  overview?: ICreditAdminOverview;
}
interface ISettingsResult extends ICreditResult {
  data?: ICreditAdminSettings;
}

/** Call `reload()` on mount (component effect). */
export const useCreditsAdminOverview = () => {
  const [overview, setOverview] = useState<ICreditAdminOverview | null>(null);
  const [error, setError] = useState<CreditError | null>(null);
  const load = useCallback(async () => {
    const result = await creditsAdminAction<IOverviewResult>('overview');
    if (result.success && result.overview) {
      setOverview(result.overview);
      setError(null);
    } else setError(result.error ?? 'unknown');
  }, []);
  return { overview, error, reload: load };
};

/** Call `reload()` on mount (component effect). */
export const useCreditsAdminSettings = () => {
  const [data, setData] = useState<ICreditAdminSettings | null>(null);
  /** Bumped whenever new data arrived → the form starts again from it (`key`). */
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<CreditError | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const result = await creditsAdminAction<ISettingsResult>('settings');
    if (result.success && result.data) {
      setData(result.data);
      setVersion(value => value + 1);
      setError(null);
    } else setError(result.error ?? 'unknown');
  }, []);

  const save = useCallback(
    async (values: { settings?: unknown; overrides?: Record<string, unknown> }) => {
      setSaving(true);
      const result = await creditsAdminAction<ISettingsResult>(
        'update',
        values as Record<string, unknown>
      );
      setSaving(false);
      if (result.success && result.data) {
        setData(result.data);
        setVersion(value => value + 1);
        return null;
      }
      return result.error ?? 'unknown';
    },
    []
  );

  return { data, version, error, saving, reload: load, save };
};

interface IBankHistoryResult extends ICreditResult {
  rows?: ICreditBankRow[];
  hasMore?: boolean;
}

/** Movements of the bank (no users) – call `load()` on mount (component effect). */
export const useCreditsBankHistory = () => {
  const [rows, setRows] = useState<ICreditBankRow[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (offset = 0) => {
    const result = await creditsAdminAction<IBankHistoryResult>('bankHistory', { offset });
    if (!result.success) return;
    const page = result.rows ?? [];
    setRows(current => (offset ? [...current, ...page] : page));
    setHasMore(Boolean(result.hasMore));
  }, []);

  return { rows, hasMore, load };
};

interface IChartResult extends ICreditResult {
  days?: ICreditChartDay[];
}

/** Daily sums for the admin chart – call `load(days)` from the component. */
export const useCreditsAdminChart = () => {
  const [days, setDays] = useState<ICreditChartDay[] | null>(null);
  const [error, setError] = useState<CreditError | null>(null);

  const load = useCallback(async (range: number) => {
    const result = await creditsAdminAction<IChartResult>('chart', { days: range });
    if (result.success && result.days) {
      setDays(result.days);
      setError(null);
    } else setError(result.error ?? 'unknown');
  }, []);

  return { days, error, load };
};
