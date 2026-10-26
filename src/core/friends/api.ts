import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import {
  UserRelationAcceptMutation,
  UserRelationBlockMutation,
  UserRelationCancelMutation,
  UserRelationListQuery,
  UserRelationRejectMutation,
  UserRelationRequestMutation,
  UserRelationStateQuery,
  UserRelationUnblockMutation,
} from './graphql';
import type { FriendsFilter, IFriendListItem, IFriendRelation } from './types';

type Client = ReturnType<ReturnType<typeof getMeshClient>['graphql']>;
type QueryDoc = Parameters<Client['query']>[0]['query'];
type MutationDoc = Parameters<Client['mutate']>[0]['mutation'];

const client = () => getMeshClient().graphql();

const query = async <T>(doc: unknown, variables: Record<string, unknown>) =>
  (await client().query({
    query: doc as QueryDoc,
    variables,
    fetchPolicy: 'no-cache',
  })) as { data?: T };

const mutate = async <T>(doc: unknown, variables: Record<string, unknown>) =>
  (await client().mutate({ mutation: doc as MutationDoc, variables })) as { data?: T };

/** Relation API (outside React – usable from stores and hooks). Errors are thrown. */
export const FriendsApi = {
  async list(status: FriendsFilter, limit: number, offset: number) {
    const { data } = await query<{
      userRelationList?: { success?: boolean; total?: number; list?: IFriendListItem[] };
    }>(UserRelationListQuery, { status, limit, offset });
    const result = data?.userRelationList;
    return {
      items: (result?.list ?? []).filter(Boolean),
      total: result?.total ?? 0,
    };
  },

  async state(targetId: string) {
    const { data } = await query<{
      userRelationState?: { relation?: IFriendRelation | null };
    }>(UserRelationStateQuery, { targetId });
    return data?.userRelationState?.relation ?? null;
  },

  async request(targetId: string) {
    const { data } = await mutate<{
      userRelationRequest?: { success?: boolean; relation?: IFriendRelation | null };
    }>(UserRelationRequestMutation, { targetId });
    return data?.userRelationRequest ?? null;
  },

  async cancel(relationId: string) {
    const { data } = await mutate<{ userRelationCancel?: { success?: boolean } }>(
      UserRelationCancelMutation,
      { id: relationId }
    );
    return Boolean(data?.userRelationCancel?.success);
  },

  async accept(relationId: string) {
    const { data } = await mutate<{ userRelationAccept?: { success?: boolean } }>(
      UserRelationAcceptMutation,
      { id: relationId }
    );
    return Boolean(data?.userRelationAccept?.success);
  },

  async reject(relationId: string) {
    const { data } = await mutate<{ userRelationReject?: { success?: boolean } }>(
      UserRelationRejectMutation,
      { id: relationId }
    );
    return Boolean(data?.userRelationReject?.success);
  },

  /** `meId` + `otherId` – the backend always acts for the signed-in user. */
  async block(meId: string, otherId: string) {
    const { data } = await mutate<{
      userRelationBlock?: { success?: boolean; relation?: IFriendRelation | null };
    }>(UserRelationBlockMutation, { sourceId: meId, targetId: otherId });
    return data?.userRelationBlock ?? null;
  },

  async unblock(meId: string, otherId: string) {
    const { data } = await mutate<{ userRelationUnblock?: { success?: boolean } }>(
      UserRelationUnblockMutation,
      { sourceId: meId, targetId: otherId }
    );
    return Boolean(data?.userRelationUnblock?.success);
  },
};
