import { create } from 'zustand/react';

export type PluginLoadingBackdrop = 'blur' | 'dim';

/** Options of `loading(state, options)`. */
export interface IPluginLoadingOptions {
  text?: string;
  /** `blur` (default) or `dim` (darkened background). */
  backdrop?: PluginLoadingBackdrop;
}

/** Background behind the spinner: blurred (default) or darkened. */
export const LOADING_BACKDROP_CLASS: Record<PluginLoadingBackdrop, string> = {
  // Text colour goes with the backdrop: muted grey on light, white on the darkened background.
  blur: 'bg-background/80 text-muted-foreground backdrop-blur-sm',
  dim: 'bg-black/50 text-white',
};

interface IPluginLoadingStore {
  /** The app-wide loading overlay of `api.loading`. */
  overlay: { active: boolean; text?: string; backdrop: PluginLoadingBackdrop };
  setOverlay: (active: boolean, options?: IPluginLoadingOptions) => void;
}

/** App-wide loading overlay (`api.loading`). The last call wins. */
export const usePluginLoadingStore = create<IPluginLoadingStore>()(set => ({
  overlay: { active: false, backdrop: 'blur' },
  setOverlay: (active, options) =>
    set({ overlay: { active, text: options?.text, backdrop: options?.backdrop ?? 'blur' } }),
}));

export const setPluginLoading = (active: boolean, options?: IPluginLoadingOptions): void =>
  usePluginLoadingStore.getState().setOverlay(active, options);
