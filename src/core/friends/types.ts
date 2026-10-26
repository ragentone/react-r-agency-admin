/** Relation status (backend `UserRelationStatus`). */
export type FriendRelationStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

/** List filter from the viewer's side (backend `UserRelationListFilter`). */
export type FriendsFilter = 'accepted' | 'incoming' | 'outgoing' | 'blocked';

/** Relation between the viewer and another user (backend `userRelation`). */
export interface IFriendRelation {
  id?: string | null;
  relationId?: string | null;
  sourceId?: string | null;
  targetId?: string | null;
  requestBy?: string | null;
  blockedBy?: string | null;
  status?: FriendRelationStatus | string | null;
}

/** One row of `userRelationList.list` (backend `IUserRelationUser`). */
export interface IFriendListItem {
  id: string;
  alias: string;
  avatarUrl?: string | null;
  online?: boolean;
  relation: {
    relationId: string;
    sourceId: string;
    targetId: string;
    status: FriendRelationStatus;
    belongs: 'source' | 'target';
    requestBy?: string;
    blockedBy?: string | null;
    createdAt?: string;
  };
}

/** What the viewer can do with another user – derived from the relation. */
export type FriendState =
  | 'none'
  | 'outgoing'
  | 'incoming'
  | 'friends'
  /** Viewer blocked the other user. */
  | 'blocked'
  /** Other user blocked the viewer → no actions. */
  | 'blockedByOther';

export interface IFriendsCounts {
  accepted: number;
  incoming: number;
  outgoing: number;
  blocked: number;
}

/** Relation actions of the signed-in user towards another user. */
export type FriendAction =
  'request' | 'cancel' | 'accept' | 'reject' | 'remove' | 'block' | 'unblock';

/** Payload of the `friends:changed` event. Without `action` → just reload everything. */
export interface IFriendsChange {
  userId?: string;
  action?: FriendAction;
}

/** Online state of a friend (`relation:presence`). */
export interface IFriendPresence {
  userId: string;
  online: boolean;
}

/** Live events on the websocket channel `user_relation` (runtime shared/user/relation/services/live). */
export interface IFriendsLiveEvents {
  /** A relation with `userId` changed somewhere (other user or another own device). */
  'relation:changed': { userId: string; action?: FriendAction };
  /** An accepted friend came online / went offline. */
  'relation:presence': IFriendPresence;
}

export interface ICmsFriendsAcceptedListItem {
  filter: FriendsFilter;
  user: {
    id: string;
    alias: string;
    avatarUrl: string | null;
    online: boolean;
  };
  close: () => void;
}
