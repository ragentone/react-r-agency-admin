import type { MonitorStatus } from './types';

/** Mirror of runtime `shared/monitor/types.alert.ts`. */
export type MonitorMetric = 'cpu' | 'mem' | 'swap' | 'disk' | 'loop' | 'db';
export const MONITOR_METRICS: readonly MonitorMetric[] = [
  'cpu',
  'mem',
  'swap',
  'disk',
  'loop',
  'db',
];
export const MONITOR_UNITS: Record<MonitorMetric, '%' | 'ms'> = {
  cpu: '%',
  mem: '%',
  swap: '%',
  disk: '%',
  loop: 'ms',
  db: 'ms',
};

export interface IMonitorRule {
  enabled: boolean;
  warn: number;
  crit: number;
  minutes: number;
}
export type IMonitorThresholds = Record<MonitorMetric, IMonitorRule>;

export interface IMonitorAlert {
  metric: MonitorMetric;
  level: 'warn' | 'crit';
  value: number;
  since: number;
}

export interface IMonitorAlertEvent {
  t: number;
  metric: MonitorMetric;
  level: 'ok' | 'warn' | 'crit';
  value: number;
}

export interface IMonitorAlerts {
  status: MonitorStatus;
  active: IMonitorAlert[];
  log: IMonitorAlertEvent[];
  thresholds: IMonitorThresholds;
  values: Record<MonitorMetric, number | null>;
}

export interface IMonitorHour {
  hour: string;
  samples: number;
  cpuAvg: number;
  cpuMax: number;
  memAvg: number;
  memMax: number;
  loopMax: number;
  rssAvg: number;
  netRx: number;
  netTx: number;
  diskFree: number;
  diskTotal: number;
  wsMax: number;
  requests: number;
  errors: number;
}

export interface IMonitorHistory {
  hours: IMonitorHour[];
  diskFullInDays: number | null;
}
