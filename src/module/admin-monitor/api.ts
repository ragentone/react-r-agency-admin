import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IMonitorSnapshot } from './types';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
const SnapshotQuery = parse(`
  query AdminMonitorSnapshot($minutes: Int) {
    adminMonitorSnapshot(minutes: $minutes) { success error snapshot }
  }
`);

export interface IMonitorResult {
  success: boolean;
  error?: string | null;
  snapshot?: IMonitorSnapshot;
}

/** Admin only (`admin:user`, checked in the runtime `shared/monitor`). */
export const AdminMonitorApi = {
  snapshot: async (minutes: number): Promise<IMonitorResult> => {
    try {
      const response = (await getMeshClient()
        .graphql()
        .query({
          query: SnapshotQuery as never,
          variables: { minutes },
          fetchPolicy: 'no-cache',
        })) as { data?: { adminMonitorSnapshot?: IMonitorResult | null } };
      return response.data?.adminMonitorSnapshot ?? { success: false, error: 'unknown' };
    } catch (error) {
      console.warn('[admin-monitor]', (error as Error)?.message);
      return { success: false, error: 'unknown' };
    }
  },
};
