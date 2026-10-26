import { create } from 'zustand/react';

import type { IAuthResult } from './types';

interface ISudoStore {
  pending: ((ok: boolean) => void) | null;
}

export const useSudoStore = create<ISudoStore>()(() => ({ pending: null }));

/** Opens the "confirm it's you" drawer; resolves `true` once confirmed (valid 10 minutes). */
export const confirmIdentity = (): Promise<boolean> =>
  new Promise(resolve => {
    useSudoStore.getState().pending?.(false);
    useSudoStore.setState({ pending: resolve });
  });

/**
 * Runs a protected call; on `sudo_required` asks for confirmation and runs it again.
 * Cancelled → the first result (`error: 'sudo_required'`) – callers just stop then.
 */
export const withSudo = async <T extends IAuthResult>(run: () => Promise<T>): Promise<T> => {
  const first = await run();
  if (first.error !== 'sudo_required') return first;
  if (!(await confirmIdentity())) return first;
  return run();
};
