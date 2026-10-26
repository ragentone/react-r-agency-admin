import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type {
  IStatsGrowth,
  IStatsLive,
  IStatsOverview,
  IStatsSecurity,
  IStatsUserActivity,
  IStatsVisitor,
  StatsRange,
  StatsVisitorFilter,
} from './types';

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
const VisitorsQuery = parse(`
  query AdminStatsVisitors($range: Int, $filter: String, $hideAdmins: Boolean, $term: String) {
    adminStatsVisitors(range: $range, filter: $filter, hideAdmins: $hideAdmins, term: $term) {
      success error visitors total
    }
  }
`);
const UserQuery = parse(`
  query AdminStatsUser($userId: ID!) {
    adminStatsUser(userId: $userId) { success error activity }
  }
`);
const GrowthQuery = parse(`
  query AdminStatsGrowth($range: Int) {
    adminStatsGrowth(range: $range) { success error growth }
  }
`);
const SecurityQuery = parse(`
  query AdminStatsSecurity($range: Int) {
    adminStatsSecurity(range: $range) { success error security }
  }
`);
const RemindMutation = parse(`
  mutation AdminStatsRemind($userId: ID!) {
    adminStatsRemind(userId: $userId) { success error }
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
  visitors: (range: StatsRange, filter: StatsVisitorFilter, hideAdmins: boolean, term: string) =>
    query<IStatsResult & { visitors?: IStatsVisitor[]; total?: number }>(
      VisitorsQuery,
      'adminStatsVisitors',
      { range, filter, hideAdmins, term }
    ),
  user: (userId: string) =>
    query<IStatsResult & { activity?: IStatsUserActivity }>(UserQuery, 'adminStatsUser', {
      userId,
    }),
  growth: (range: StatsRange) =>
    query<IStatsResult & { growth?: IStatsGrowth }>(GrowthQuery, 'adminStatsGrowth', { range }),
  security: (range: StatsRange) =>
    query<IStatsResult & { security?: IStatsSecurity }>(SecurityQuery, 'adminStatsSecurity', {
      range,
    }),
  remind: async (userId: string): Promise<IStatsResult> => {
    try {
      const response = (await client().mutate({
        mutation: RemindMutation as never,
        variables: { userId },
      })) as { data?: { adminStatsRemind?: IStatsResult | null } };
      return response.data?.adminStatsRemind ?? { success: false, error: 'unknown' };
    } catch {
      return { success: false, error: 'unknown' };
    }
  },
};
