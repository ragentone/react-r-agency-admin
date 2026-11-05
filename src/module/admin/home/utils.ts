import { ADMIN_SYSTEM_VIEW_KEY } from '../const';
import type { SystemTab } from '../system/types';

export const rememberSystemTab = (tab: SystemTab) => {
  try {
    localStorage.setItem(ADMIN_SYSTEM_VIEW_KEY, tab);
  } catch {
    // per-device convenience only
  }
};
