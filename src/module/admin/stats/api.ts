import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IStatsLive, IStatsOverview, IStatsSecurity, StatsRange } from './types';

/*
 * Parsed here instead of codegen `graphql()`: an operation codegen hasn't seen yet (Vite not
 * restarted after the runtime) would otherwise be an empty document.
 */
const LiveQuery = parse(`
  query AdminStatsLive {
    adminStatsLive { success error live }
  }
`);
const OverviewQuery = parse(`
  query AdminStatsOverview($range: Int) {
    adminStatsOverview(range: $range) { success error stats }
  }
`);
const SecurityQuery = parse(`
  query AdminStatsSecurity($range: Int) {
    adminStatsSecurity(range: $range) { success error security }
  }
`);

export interface IStatsResult {
  success: boolean;
  error?: string | null;
}

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
    console.warn('[admin-stats]', (error as Error)?.message);
    return { success: false, error: 'unknown' } as T;
  }
};

/** Admin only (`admin:user`, checked in the runtime). */
export const StatsApi = {
  live: () => query<IStatsResult & { live?: IStatsLive }>(LiveQuery, 'adminStatsLive'),
  overview: (range: StatsRange) =>
    query<IStatsResult & { stats?: IStatsOverview }>(OverviewQuery, 'adminStatsOverview', {
      range,
    }),
  security: (range: StatsRange) =>
    query<IStatsResult & { security?: IStatsSecurity }>(SecurityQuery, 'adminStatsSecurity', {
      range,
    }),
};
