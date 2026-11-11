import { create } from 'zustand/react';

import type { IPluginDialogComponent, IPluginDialogOptions } from './plugin.types';

export interface IPluginDialogRequest extends IPluginDialogOptions {
  pluginId: string;
  component: IPluginDialogComponent;
}

interface IPluginDialogStore {
  /** The open dialog, or `undefined` when none is shown. */
  request: IPluginDialogRequest | undefined;
  /** Fullscreen loading overlay of the open dialog. */
  loading: { active: boolean; text?: string };
  open: (request: IPluginDialogRequest) => void;
  close: () => void;
  setLoading: (active: boolean, text?: string) => void;
}

/** Host-wide dialog of plugins (`api.openDialog`). Only one is open at a time. */
export const usePluginDialogStore = create<IPluginDialogStore>()(set => ({
  request: undefined,
  loading: { active: false },
  open: request => set({ request, loading: { active: false } }),
  close: () => set({ request: undefined, loading: { active: false } }),
  setLoading: (active, text) => set({ loading: { active, text } }),
}));

export const openPluginDialog = (
  pluginId: string,
  component: IPluginDialogComponent,
  options: IPluginDialogOptions
): void => usePluginDialogStore.getState().open({ ...options, pluginId, component });
