import { useAuthStore } from '@core/auth/auth.store.tsx';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { isCreditsActive } from './feature.ts';
import { useCreditsStore } from './store.ts';
import { formatCredits } from './utils.ts';

/** Catalog of the runtime (rules, products, tips, limits) – loaded once. */
export const useCreditsCatalog = () => {
  const catalog = useCreditsStore(state => state.catalog);
  const signedIn = useAuthStore(state => Boolean(state.authorized && state.userMeta?.id));
  useEffect(() => {
    if (signedIn && isCreditsActive() && !catalog) void useCreditsStore.getState().loadCatalog();
  }, [catalog, signedIn]);
  return catalog;
};

/** One product of the catalog (price, duration) – `null` while loading or when disabled. */
export const useCreditProduct = (key: string) => {
  const catalog = useCreditsCatalog();
  return catalog?.products.find(product => product.key === key) ?? null;
};

/** One tip context of the catalog – `null` while loading or when disabled. */
export const useCreditTipContext = (key: string) => {
  const catalog = useCreditsCatalog();
  return catalog?.tips.find(tip => tip.key === key) ?? null;
};

/** Credits UI usable: module active + signed in. */
export const useCreditsEnabled = () => {
  const signedIn = useAuthStore(state => Boolean(state.authorized && state.userMeta?.id));
  return isCreditsActive() && signedIn;
};

export const useCreditsFormat = () => {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;
  return (value: number) => formatCredits(value, locale);
};
