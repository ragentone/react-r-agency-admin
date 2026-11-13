import type { IAuthResult } from '@core/security/types';
import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { ICronJob, ICronRun } from './types';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
const doc = {
  list: parse(`query AdminCronList { adminCronList { success error list } }`),
  runs: parse(
    `query AdminCronRuns($name: String) { adminCronRuns(name: $name) { success error list } }`
  ),
  run: parse(
    `mutation AdminCronRun($name: String!) { adminCronRun(name: $name) { success error run } }`
  ),
};

export interface ICronResult {
  success: boolean;
  error?: string | null;
}

const client = () => getMeshClient().graphql();

const run = async <T extends ICronResult>(call: () => Promise<unknown>, field: string) => {
  try {
    const response = (await call()) as { data?: Record<string, T | null> };
    return response.data?.[field] ?? ({ success: false, error: 'unknown' } as T);
  } catch (error) {
    console.warn('[admin-cron]', (error as Error)?.message);
    return { success: false, error: 'unknown' } as T;
  }
};

/** Admin only (`admin:user`, checked in the runtime `shared/cron`). */
export const AdminCronApi = {
  list: () =>
    run<ICronResult & { list?: ICronJob[] }>(
      () => client().query({ query: doc.list as never, fetchPolicy: 'no-cache' }),
      'adminCronList'
    ),
  runs: (name?: string) =>
    run<ICronResult & { list?: ICronRun[] }>(
      () =>
        client().query({ query: doc.runs as never, variables: { name }, fetchPolicy: 'no-cache' }),
      'adminCronRuns'
    ),
  /** Needs sudo (confirm identity): wrap in `withSudo`. */
  run: (name: string) =>
    run<IAuthResult & { run?: ICronRun }>(
      () => client().mutate({ mutation: doc.run as never, variables: { name } }),
      'adminCronRun'
    ),
};
