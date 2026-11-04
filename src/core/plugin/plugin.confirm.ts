import { create } from 'zustand/react';

import type { IPluginConfirmOptions } from './plugin.types';

interface IPluginConfirmRequest extends IPluginConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

interface IPluginConfirmStore {
  /** The open question, or `undefined` when no dialog is shown. */
  request: IPluginConfirmRequest | undefined;
  ask: (options: IPluginConfirmOptions) => Promise<boolean>;
  answer: (confirmed: boolean) => void;
}

/** Host-wide queue of plugin confirm dialogs. Only one is open at a time. */
export const usePluginConfirmStore = create<IPluginConfirmStore>()((set, get) => ({
  request: undefined,
  ask: options =>
    new Promise<boolean>(resolve => {
      // A newer question replaces the open one; the older caller gets `false`.
      get().request?.resolve(false);
      set({ request: { ...options, resolve } });
    }),
  answer: confirmed => {
    const current = get().request;
    if (!current) return;
    set({ request: undefined });
    current.resolve(confirmed);
  },
}));
