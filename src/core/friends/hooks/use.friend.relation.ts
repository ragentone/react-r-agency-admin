import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../../auth/components/use.auth.ts';
import { FriendsApi } from '../api';
import { usePendingFriendAction } from '../store';
import type { FriendAction, IFriendRelation } from '../types';
import { FRIEND_STATE_AFTER, getFriendState, onFriendsChanged } from '../utils';

/**
 * Live relation to `otherId`: starts with `initial` (e.g. from the profile load) and reloads
 * after every relation change concerning this user. Without `initial` (undefined) it loads once.
 * `state` is optimistic: while an action is pending (or its result is being reloaded) it already
 * shows the target state.
 */
export const useFriendRelation = (
  otherId: string | null | undefined,
  initial?: IFriendRelation | null
) => {
  const { userMeta, authorized } = useAuth();
  const meId = userMeta?.id ?? null;
  const [relation, setRelation] = useState<IFriendRelation | null>(initial ?? null);
  const [loading, setLoading] = useState(initial === undefined);
  /** Action that just succeeded – bridges the gap until the reloaded relation arrives. */
  const [settling, setSettling] = useState<FriendAction | null>(null);
  const pending = usePendingFriendAction(otherId);
  const request = useRef(0);

  // Another user (e.g. profile → profile navigation) → start over with the new initial value.
  const [forId, setForId] = useState(otherId);
  if (forId !== otherId) {
    setForId(otherId);
    setRelation(initial ?? null);
    setLoading(initial === undefined);
    setSettling(null);
  }

  const refresh = useCallback(async () => {
    if (!otherId || !authorized) return;
    const id = ++request.current;
    setLoading(true);
    try {
      const next = await FriendsApi.state(otherId);
      if (id === request.current) setRelation(next);
    } catch (error) {
      console.warn('[friends] state failed', error);
    } finally {
      if (id === request.current) {
        setLoading(false);
        setSettling(null);
      }
    }
  }, [authorized, otherId]);

  const known = initial !== undefined;
  useEffect(() => {
    if (!known) queueMicrotask(() => void refresh());
  }, [known, refresh]);

  useEffect(
    () =>
      onFriendsChanged(({ userId, action }) => {
        if (userId && userId !== otherId) return;
        if (action) setSettling(action);
        void refresh();
      }),
    [otherId, refresh]
  );

  const optimistic = pending ?? settling;
  const state = optimistic ? FRIEND_STATE_AFTER[optimistic] : getFriendState(relation, meId);

  return { relation, state, loading, pending: pending ?? null, refresh, meId };
};
