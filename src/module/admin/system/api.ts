import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IStatsResult } from '../stats/api';
import type {
  ISystemDeployHistory,
  ISystemRelease,
  ISystemStorage,
  SystemReleaseBump,
} from './types';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
const DeploysQuery = parse(`
  query AdminSystemDeploys($limit: Int) {
    adminSystemDeploys(limit: $limit) { success error history }
  }
`);
const StorageQuery = parse(`
  query AdminSystemStorage($refresh: Boolean) {
    adminSystemStorage(refresh: $refresh) { success error storage }
  }
`);
const ReleasePlanMutation = parse(`
  mutation AdminSystemReleasePlan($bump: String, $notes: String, $required: Boolean) {
    adminSystemReleasePlan(bump: $bump, notes: $notes, required: $required) {
      success error release
    }
  }
`);

const client = () => getMeshClient().graphql();

const query = async <T extends IStatsResult>(
  doc: unknown,
  field: string,
  variables?: Record<string, unknown>
): Promise<T> => {
  try {
    const response = (await client().query({
      query: doc as never,
      variables,
      fetchPolicy: 'no-cache',
    })) as { data?: Record<string, T | null> };
    return response.data?.[field] ?? ({ success: false, error: 'unknown' } as T);
  } catch (error) {
    console.warn('[admin-system]', (error as Error)?.message);
    return { success: false, error: 'unknown' } as T;
  }
};

/** Admin only (`admin:user`, checked in the runtime `shared/system`). */
export const SystemApi = {
  deploys: (limit = 50) =>
    query<IStatsResult & { history?: ISystemDeployHistory }>(DeploysQuery, 'adminSystemDeploys', {
      limit,
    }),
  storage: (refresh = false) =>
    query<IStatsResult & { storage?: ISystemStorage }>(StorageQuery, 'adminSystemStorage', {
      refresh,
    }),
  releasePlan: async (plan: {
    bump: SystemReleaseBump;
    notes: string;
    required: boolean;
  }): Promise<IStatsResult & { release?: ISystemRelease }> => {
    try {
      const response = (await client().mutate({
        mutation: ReleasePlanMutation as never,
        variables: plan,
      })) as { data?: { adminSystemReleasePlan?: IStatsResult & { release?: ISystemRelease } } };
      return response.data?.adminSystemReleasePlan ?? { success: false, error: 'unknown' };
    } catch {
      return { success: false, error: 'unknown' };
    }
  },
};
