import { ADMIN_STATS_VIEW_KEY, ADMIN_SYSTEM_VIEW_KEY } from '../const';
import type { StatsRange, StatsTab } from '../stats/types';
import type { SystemTab } from '../system/types';

/** Thresholds of the "needs attention" list (display only). */
export const HOME_IP_ACCOUNTS = 3;
export const HOME_IP_FAILURES = 20;
export const HOME_SILENT_MAX = 3;
export const HOME_MEMBERS_MAX = 5;
export const HOME_LIVE_AVATARS = 5;

/** `/admin/stats` restores its tab (and range) from localStorage – set it before navigating. */
export const rememberStatsTab = (tab: StatsTab, range?: StatsRange) => {
  try {
    const value = JSON.parse(localStorage.getItem(ADMIN_STATS_VIEW_KEY) ?? '{}');
    localStorage.setItem(
      ADMIN_STATS_VIEW_KEY,
      JSON.stringify({ ...value, tab, ...(range ? { range } : {}) })
    );
  } catch {
    // per-device convenience only
  }
};

export const rememberSystemTab = (tab: SystemTab) => {
  try {
    localStorage.setItem(ADMIN_SYSTEM_VIEW_KEY, tab);
  } catch {
    // per-device convenience only
  }
};
