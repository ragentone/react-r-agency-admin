import { create } from 'zustand/react';

interface IPluginLoadingStore {
  /** The app-wide loading overlay of `api.loading`. */
  overlay: { active: boolean; text?: string };
  setOverlay: (active: boolean, text?: string) => void;
}

/** App-wide loading overlay (`api.loading`). The last call wins. */
export const usePluginLoadingStore = create<IPluginLoadingStore>()(set => ({
  overlay: { active: false },
  setOverlay: (active, text) => set({ overlay: { active, text } }),
}));

export const setPluginLoading = (active: boolean, text?: string): void =>
  usePluginLoadingStore.getState().setOverlay(active, text);
