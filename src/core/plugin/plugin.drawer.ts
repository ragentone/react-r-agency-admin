import { create } from 'zustand/react';

import type { IPluginDrawerComponent, IPluginDrawerOptions } from './plugin.types';

export interface IPluginDrawerRequest extends IPluginDrawerOptions {
  pluginId: string;
  component: IPluginDrawerComponent;
}

interface IPluginDrawerStore {
  /** The open drawer, or `undefined` when none is shown. */
  request: IPluginDrawerRequest | undefined;
  open: (request: IPluginDrawerRequest) => void;
  close: () => void;
}

/** Host-wide drawer of plugins (`api.openDrawer`). Only one is open at a time. */
export const usePluginDrawerStore = create<IPluginDrawerStore>()(set => ({
  request: undefined,
  open: request => set({ request }),
  close: () => set({ request: undefined }),
}));

export const openPluginDrawer = (
  pluginId: string,
  component: IPluginDrawerComponent,
  options: IPluginDrawerOptions
): void => usePluginDrawerStore.getState().open({ ...options, pluginId, component });
