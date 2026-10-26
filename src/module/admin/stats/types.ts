/**
 * Same types as the backend (runtime shared/stats/types) – keep in sync.
 */

export const STATS_RANGES = [1, 7, 30, 365] as const;
export type StatsRange = (typeof STATS_RANGES)[number];
export type StatsDevice = 'mobile' | 'tablet' | 'desktop';
export type StatsVisitorFilter = 'all' | 'new' | 'guests' | 'pwa';
export type StatsTab = 'live' | 'visitors' | 'overview' | 'growth' | 'security';

// ---- results ----------------------------------------------------------------------------

export interface IStatsUserRef {
  id: string;
  alias: string;
  avatarUrl: string | null;
}

export interface IStatsLiveItem {
  user: IStatsUserRef | null;
  /** guest / minor / anonymous (DNT) */
  kind: 'user' | 'guest' | 'minor';
  path: string;
  app: string;
  platform: string;
  browser: string;
  device: StatsDevice;
  standalone: boolean;
  source: string;
  since: string;
  lastSeen: string;
}

export interface IStatsLive {
  online: number;
  users: number;
  guests: number;
  items: IStatsLiveItem[];
  /** Online per minute, oldest first. */
  curve: Array<{ at: string; online: number }>;
  apps: Array<{ key: string; online: number }>;
}

export interface IStatsSeriesDay {
  day: string;
  users: number;
  guests: number;
  views: number;
  sessions: number;
  bounces: number;
  seconds: number;
  registrations: number;
}

export interface IStatsKeyValue {
  key: string;
  value: number;
  /** Second value (e.g. guests, exits). */
  value2?: number;
}

export interface IStatsKpi {
  visitors: number;
  activeUsers: number;
  registrations: number;
  views: number;
  avgSeconds: number;
  bounceRate: number | null;
}

export interface IStatsOverview {
  range: StatsRange;
  /** Unique visitors over several days are summed per day for 12 months. */
  approx: boolean;
  kpi: IStatsKpi;
  previous: IStatsKpi;
  days: IStatsSeriesDay[];
  previousDays: IStatsSeriesDay[];
  totalUsers: number;
  /** Total users at the end of each day (for the cumulative line). */
  totalByDay: number[];
  activity: Array<{ day: string; dau: number; wau: number; mau: number }>;
  heatmap: number[][];
  hours: number[];
  pages: IStatsKeyValue[];
  apps: IStatsKeyValue[];
  appDays: Array<{ day: string; values: Record<string, number> }>;
  entries: IStatsKeyValue[];
  exits: IStatsKeyValue[];
  sources: IStatsKeyValue[];
  devices: IStatsKeyValue[];
  platforms: IStatsKeyValue[];
  browsers: IStatsKeyValue[];
  locales: IStatsKeyValue[];
  pwa: { share: number | null; days: Array<{ day: string; share: number | null }> };
}

export interface IStatsVisitor {
  key: string;
  user: IStatsUserRef | null;
  kind: 'user' | 'guest' | 'minor';
  admin: boolean;
  isNew: boolean;
  firstAt: string;
  lastAt: string;
  views: number;
  seconds: number;
  platform: string;
  browser: string;
  device: StatsDevice;
  standalone: boolean;
  source: string;
  lastPath: string;
}

export interface IStatsUserActivity {
  minor: boolean;
  days: Array<{ day: string; views: number; seconds: number }>;
  apps: IStatsKeyValue[];
  pages: Array<{ path: string; at: string; seconds: number }>;
  lastAt: string | null;
  total: { days: number; views: number; seconds: number };
}

export interface IStatsCohort {
  week: string;
  size: number;
  /** Share active in week 1 / 2 / 4 / 8 after sign-up (null = not reached yet). */
  weeks: Array<number | null>;
}

export interface IStatsGrowth {
  cohorts: IStatsCohort[];
  curve: Array<{ day: number; share: number | null }>;
  registerFunnel: IStatsKeyValue[];
  activationFunnel: IStatsKeyValue[];
  silent: IStatsKeyValue[];
  silentUsers: Array<IStatsUserRef & { lastAt: string | null; days: number }>;
  invites: {
    total: number;
    days: Array<{ day: string; value: number }>;
    top: Array<IStatsUserRef & { count: number }>;
  };
}

export interface IStatsSecurity {
  /** Failed sign-ins are kept 30 days. */
  failures: Array<{ day: string; known: number; unknown: number }>;
  methods: IStatsKeyValue[];
  stepUps: Array<{ day: string; value: number }>;
  bots: Array<{ day: string; value: number }>;
  ips: Array<{ ip: string; failures: number; accounts: number; lastAt: string }>;
  totals: { failures: number; stepUps: number; bots: number };
}

export type StatsError = 'not_authorized' | 'not_found' | 'invalid' | 'unknown';
