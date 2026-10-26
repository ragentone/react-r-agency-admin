import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import { NOTIFY_SCOPE } from './const';
import {
  UserNotifyClearMutation,
  UserNotifyDeleteMutation,
  UserNotifyListingQuery,
  UserNotifySeenAllMutation,
  UserNotifySeenMutation,
  UserNotifyStateQuery,
} from './graphql';
import type { INotifyItem, INotifyRaw, INotifyState, NotifyFilter } from './types';
import { normalizeNotify, normalizeState } from './utils';

type Client = ReturnType<ReturnType<typeof getMeshClient>['graphql']>;
type QueryDoc = Parameters<Client['query']>[0]['query'];
type MutationDoc = Parameters<Client['mutate']>[0]['mutation'];

const client = () => getMeshClient().graphql();

const query = async <T>(doc: unknown, variables: Record<string, unknown> = {}) =>
  (await client().query({
    query: doc as QueryDoc,
    variables,
    fetchPolicy: 'no-cache',
  })) as { data?: T };

const mutate = async <T>(doc: unknown, variables: Record<string, unknown> = {}) =>
  (await client().mutate({ mutation: doc as MutationDoc, variables })) as { data?: T };

interface IMutationResult {
  success?: boolean;
  state?: Partial<INotifyState> | null;
}

/** Throws when the backend reports no success (callers roll back optimistic changes). */
const expectSuccess = (result: IMutationResult | undefined, name: string) => {
  if (!result?.success) throw new Error(`${name} failed`);
  return result.state ? normalizeState(result.state) : null;
};

/** Notification API (outside React – usable from the store). Errors are thrown. */
export const NotifyApi = {
  async state(): Promise<INotifyState> {
    const { data } = await query<{ userNotifyState?: Partial<INotifyState> }>(
      UserNotifyStateQuery,
      {
        scope: NOTIFY_SCOPE,
      }
    );
    return normalizeState(data?.userNotifyState);
  },

  async listing(
    page: number,
    limit: number,
    filter: NotifyFilter
  ): Promise<{
    items: INotifyItem[];
    total: number;
    hasMore: boolean;
    state: INotifyState | null;
  }> {
    const { data } = await query<{
      userNotifyListing?: {
        success?: boolean;
        total?: number;
        hasNextPage?: boolean;
        state?: Partial<INotifyState> | null;
        records?: (INotifyRaw | null)[] | null;
      };
    }>(UserNotifyListingQuery, { page, limit, filter, scope: NOTIFY_SCOPE });
    const result = data?.userNotifyListing;
    if (!result) throw new Error('userNotifyListing failed');
    return {
      items: (result.records ?? [])
        .map(record => (record ? normalizeNotify(record) : null))
        .filter((item): item is INotifyItem => item !== null),
      total: result.total ?? 0,
      hasMore: Boolean(result.hasNextPage),
      state: result.state ? normalizeState(result.state) : null,
    };
  },

  async seen(notifyId: string) {
    const { data } = await mutate<{ userNotifySeen?: IMutationResult }>(UserNotifySeenMutation, {
      notifyId,
    });
    return expectSuccess(data?.userNotifySeen, 'userNotifySeen');
  },

  async seenAll() {
    const { data } = await mutate<{ userNotifySeenAll?: IMutationResult }>(
      UserNotifySeenAllMutation,
      { scope: NOTIFY_SCOPE }
    );
    return expectSuccess(data?.userNotifySeenAll, 'userNotifySeenAll');
  },

  async remove(notifyId: string) {
    const { data } = await mutate<{ userNotifyDelete?: IMutationResult }>(
      UserNotifyDeleteMutation,
      { notifyId }
    );
    return expectSuccess(data?.userNotifyDelete, 'userNotifyDelete');
  },

  async clear() {
    const { data } = await mutate<{ userNotifyClear?: IMutationResult }>(UserNotifyClearMutation, {
      scope: NOTIFY_SCOPE,
    });
    return expectSuccess(data?.userNotifyClear, 'userNotifyClear');
  },
};
