import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../auth/components/use.auth.ts';
import { SearchApi } from '../api';
import { SEARCH_STORAGE_BUNDLES } from '../const';
import type { ISearchBundle } from '../types';

const readSelection = (): string[] | null => {
  try {
    const raw = localStorage.getItem(SEARCH_STORAGE_BUNDLES);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string') : null;
  } catch {
    return null;
  }
};

const writeSelection = (aliases: string[]) => {
  try {
    localStorage.setItem(SEARCH_STORAGE_BUNDLES, JSON.stringify(aliases));
  } catch {
    /* private mode */
  }
};

/** Available bundles + the viewer's selection (remembered per browser). */
export const useSearchConfig = (enabled: boolean) => {
  const { authorized } = useAuth();
  const [bundles, setBundles] = useState<ISearchBundle[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selection, setSelection] = useState<string[] | null>(readSelection);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    SearchApi.config()
      .then(result => {
        if (active) setBundles(result);
      })
      .catch(error => console.warn('[search] config failed', error))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
    // Reload when signing in/out (auth-only bundles).
  }, [enabled, authorized]);

  /** Selected bundle aliases – default: bundles the backend marks active. */
  const selected = useMemo(() => {
    const available = bundles.map(bundle => bundle.alias);
    const chosen = selection?.filter(alias => available.includes(alias)) ?? [];
    return chosen.length > 0
      ? chosen
      : bundles.filter(bundle => bundle.active).map(bundle => bundle.alias);
  }, [bundles, selection]);

  const allSelected = bundles.length > 0 && selected.length === bundles.length;

  const save = useCallback((next: string[]) => {
    setSelection(next);
    writeSelection(next);
  }, []);

  /** Chip logic: from "all", a tap focuses one bundle; afterwards taps add/remove bundles. */
  const toggle = useCallback(
    (alias: string) => {
      if (allSelected && bundles.length > 1) return save([alias]);
      const next = selected.includes(alias)
        ? selected.filter(item => item !== alias)
        : [...selected, alias];
      // Nothing left → back to all bundles.
      save(next.length > 0 ? next : bundles.map(bundle => bundle.alias));
    },
    [allSelected, bundles, save, selected]
  );

  const selectAll = useCallback(() => save(bundles.map(bundle => bundle.alias)), [bundles, save]);

  return { bundles, selected, allSelected, toggle, selectAll, loaded };
};
