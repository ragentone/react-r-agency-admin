import type { IAuthResult } from '@core/security/types';
import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IMonitorSnapshot } from './types';
import type { IMonitorAlerts, IMonitorHistory, IMonitorThresholds } from './types.alert';
import type { IMonitorApp } from './types.app';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
const doc = {
  snapshot: parse(
    `query AdminMonitorSnapshot($minutes: Int) { adminMonitorSnapshot(minutes: $minutes) { success error snapshot } }`
  ),
  app: parse(`query AdminMonitorApp { adminMonitorApp { success error app } }`),
  alerts: parse(`query AdminMonitorAlerts { adminMonitorAlerts { success error alerts } }`),
  history: parse(
    `query AdminMonitorHistory($hours: Int) { adminMonitorHistory(hours: $hours) { success error history } }`
  ),
  save: parse(
    `mutation AdminMonitorThresholdsSave($thresholds: JSON!) { adminMonitorThresholdsSave(thresholds: $thresholds) { success error thresholds } }`
  ),
  kill: parse(
    `mutation AdminMonitorKill($pid: Int!, $signal: String) { adminMonitorKill(pid: $pid, signal: $signal) { success error } }`
  ),
};

export interface IMonitorResult {
  success: boolean;
  error?: string | null;
}

const client = () => getMeshClient().graphql();

/** Runs a query / mutation and returns the named result field; errors become `success: false`. */
const run = async <T extends IMonitorResult>(
  call: () => Promise<unknown>,
  field: string
): Promise<T> => {
  try {
    const response = (await call()) as { data?: Record<string, T | null> };
    return response.data?.[field] ?? ({ success: false, error: 'unknown' } as T);
  } catch (error) {
    console.warn('[admin-monitor]', (error as Error)?.message);
    return { success: false, error: 'unknown' } as T;
  }
};

const read = <T extends IMonitorResult>(query: unknown, field: string, variables?: object) =>
  run<T>(
    () => client().query({ query: query as never, variables, fetchPolicy: 'no-cache' }),
    field
  );

const write = <T extends IMonitorResult>(mutation: unknown, field: string, variables: object) =>
  run<T>(() => client().mutate({ mutation: mutation as never, variables }), field);

/** Admin only (`admin:user`, checked in the runtime `shared/monitor`). */
export const AdminMonitorApi = {
  snapshot: (minutes: number) =>
    read<IMonitorResult & { snapshot?: IMonitorSnapshot }>(doc.snapshot, 'adminMonitorSnapshot', {
      minutes,
    }),
  app: () => read<IMonitorResult & { app?: IMonitorApp }>(doc.app, 'adminMonitorApp'),
  alerts: () =>
    read<IMonitorResult & { alerts?: IMonitorAlerts }>(doc.alerts, 'adminMonitorAlerts'),
  history: (hours: number) =>
    read<IMonitorResult & { history?: IMonitorHistory }>(doc.history, 'adminMonitorHistory', {
      hours,
    }),
  saveThresholds: (thresholds: IMonitorThresholds) =>
    write<IMonitorResult & { thresholds?: IMonitorThresholds }>(
      doc.save,
      'adminMonitorThresholdsSave',
      { thresholds }
    ),
  /** Needs sudo (confirm identity): wrap in `withSudo`. */
  kill: (pid: number, signal: 'SIGTERM' | 'SIGKILL') =>
    write<IAuthResult>(doc.kill, 'adminMonitorKill', { pid, signal }),
};
