/**
 * Same shapes as the backend (runtime shared/stats/types) – keep in sync. Counts only: no person,
 * page or IP data exists in the statistics.
 */

export const STATS_RANGES = [1, 7, 30, 365] as const;
export type StatsRange = (typeof STATS_RANGES)[number];
export type StatsTab = 'live' | 'overview' | 'security';

export interface IStatsCounts {
  users: number;
  guests: number;
  /** users + guests */
  views: number;
  bots: number;
}

export interface IStatsDay extends IStatsCounts {
  day: string;
}

export interface IStatsLive {
  online: number;
  users: number;
  guests: number;
  /** Online per minute, oldest first. */
  curve: Array<{ at: string; online: number }>;
}

export interface IStatsOverview {
  range: StatsRange;
  totals: IStatsCounts & { registrations: number };
  previous: IStatsCounts & { registrations: number };
  days: IStatsDay[];
}

export interface IStatsSecurity {
  failures: Array<{ day: string; known: number; unknown: number }>;
  bots: Array<{ day: string; value: number }>;
  totals: { failures: number; bots: number };
}

/** Avatar of a signed-in user (shown on the start page). */
export interface IStatsUserRef {
  id: string;
  alias: string;
  avatarUrl: string | null;
}

/** One new account (admin home). Under 16: no alias, no e-mail, no id. */
export interface IStatsNewUser {
  id: string | null;
  alias: string | null;
  email: string | null;
  registeredAt: string;
  confirmed: boolean;
  minor: boolean;
}

export interface IStatsNewUsers {
  range: StatsRange;
  total: number;
  users: IStatsNewUser[];
}
