import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { DebugSortDir, DebugSortField, IDebugReport } from './types';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
const DebugReportsQuery = parse(`
  query AdminDebugReports($page: Int, $pageSize: Int, $orderBy: String, $orderDir: String) {
    debugReportList(page: $page, pageSize: $pageSize, orderBy: $orderBy, orderDir: $orderDir) { success error total page pageSize items }
  }
`);
const DebugTestMutation = parse(`
  mutation AdminDebugTest($events: JSON!) {
    debugClientReport(events: $events) { success accepted }
  }
`);
const DebugDeleteMutation = parse(`
  mutation AdminDebugDelete($ids: JSON, $all: Boolean) {
    debugReportDelete(ids: $ids, all: $all) { success error deleted }
  }
`);

export interface IDebugReportPage {
  success: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pageSize?: number;
  items?: IDebugReport[];
}

export interface IDebugTestResult {
  success: boolean;
  accepted?: number;
  error?: string | null;
}

export interface IDebugDeleteResult {
  success: boolean;
  deleted?: number;
  error?: string | null;
}

const client = () => getMeshClient().graphql();

/** Runs a query or mutation and returns the named result field; errors become `success: false`. */
const run = async <T extends { success: boolean; error?: string | null }>(
  call: () => Promise<unknown>,
  field: string
): Promise<T> => {
  try {
    const response = (await call()) as { data?: Record<string, T | null> };
    return response.data?.[field] ?? ({ success: false, error: 'unknown' } as T);
  } catch (error) {
    console.warn('[admin-debug]', (error as Error)?.message);
    return { success: false, error: 'unknown' } as T;
  }
};

/** Admin only (`admin:user`, checked in the runtime `shared/debug`). */
export const AdminDebugApi = {
  reports: (page: number, pageSize: number, orderBy: DebugSortField, orderDir: DebugSortDir) =>
    run<IDebugReportPage>(
      () =>
        client().query({
          query: DebugReportsQuery as never,
          variables: { page, pageSize, orderBy, orderDir },
          fetchPolicy: 'no-cache',
        }),
      'debugReportList'
    ),

  /** Sends three test events (error, warn, info) through the public client report mutation. */
  sendTest: () =>
    run<IDebugTestResult>(
      () =>
        client().mutate({
          mutation: DebugTestMutation as never,
          variables: {
            events: [
              { level: 'error', source: 'admin', tag: 'admin-test', message: 'Test error from admin', error: 'Error: admin test' },
              { level: 'warn', source: 'admin', tag: 'admin-test', message: 'Test warning from admin' },
              { level: 'info', source: 'admin', tag: 'admin-test', message: 'Test info from admin' },
            ],
          },
        }),
      'debugClientReport'
    ),

  /** Deletes the given row ids, or everything with `all: true`. */
  remove: (input: { ids?: string[]; all?: boolean }) =>
    run<IDebugDeleteResult>(
      () =>
        client().mutate({
          mutation: DebugDeleteMutation as never,
          variables: { ids: input.ids ?? null, all: input.all ?? false },
        }),
      'debugReportDelete'
    ),
};
