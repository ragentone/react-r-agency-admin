import { useSyncExternalStore } from 'react';

import { PageBlockManager } from './manager.ts';

/** Registered app blocks (re-renders when an app registers / removes one). */
export const usePageBlockRegistry = () => {
  useSyncExternalStore(
    PageBlockManager.subscribe,
    PageBlockManager.getVersion,
    PageBlockManager.getVersion
  );
  return PageBlockManager;
};
