import type { MonitorStatus } from './types';

/** Mirror of runtime `shared/monitor/types.alert.ts`. */
/** Id of a metric: built-in (`cpu` …) or registered by a module (`minecraft.mem`). */
export type MonitorMetric = string;
export type MonitorUnit = '%' | 'ms';

/** Name per language (`de`, `en`, `ru`); fallback `en`, then the id. */
export type MonitorLabels = Record<string, string>;

export interface IMonitorRule {
  enabled: boolean;
  warn: number;
  crit: number;
  minutes: number;
}
export type IMonitorThresholds = Record<MonitorMetric, IMonitorRule>;

/** Mirror of runtime `IMonitorMetricInfo`: all the admin needs to show and edit a metric. */
export interface IMonitorMetricInfo {
  id: MonitorMetric;
  unit: MonitorUnit;
  labels: MonitorLabels;
  defaults: IMonitorRule;
}

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
  metrics: IMonitorMetricInfo[];
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
