import { create } from 'zustand';

import type { ISeoConfig, ISeoPageMeta } from './types';

interface ISeoStore {
  config: ISeoConfig | null;
  /** Meta of the page that is shown right now (`useSeo`) – only used for this path. */
  page: { path: string; meta: ISeoPageMeta; owner: symbol } | null;
  setConfig: (config: ISeoConfig) => void;
}

export const useSeoStore = create<ISeoStore>(set => ({
  config: null,
  page: null,
  setConfig: config => set({ config }),
}));

const listeners = new Set<() => void>();

/** Loads the SEO config again (after the admin saved something). */
export const refreshSeoConfig = () => listeners.forEach(listener => listener());

export const onSeoConfigRefresh = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
