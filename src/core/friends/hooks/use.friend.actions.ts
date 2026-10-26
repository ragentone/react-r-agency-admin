import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAuth } from '../../auth/components/use.auth.ts';
import { FriendsApi } from '../api';
import { FRIENDS_UNDO_MS } from '../const';
import { useFriendsStore } from '../store';
import type { FriendAction, FriendsFilter, IFriendRelation, IFriendsCounts } from '../types';
import { countDelta, emitFriendsChanged, invertDelta } from '../utils';

/** Reversible actions waiting in their undo window – committed early when the page is left. */
const deferred = new Map<string, () => void>();
let flushBound = false;
const bindFlush = () => {
  if (flushBound || typeof window === 'undefined') return;
  flushBound = true;
  window.addEventListener('pagehide', () => deferred.forEach(commit => commit()));
};

type Task = () => Promise<boolean>;

interface IRunOptions {
  delta: Partial<IFriendsCounts>;
  /** Toast after success (`{{name}}` is interpolated). */
  successKey?: string;
  name: string;
}

/**
 * Relation actions of the signed-in user towards another user.
 *
 * - Optimistic: rows disappear, buttons switch and counters change immediately
 *   (`useFriendsStore.pending`); on failure everything rolls back.
 * - Decline / withdraw / remove are not sent right away: a toast offers "Undo" for
 *   `FRIENDS_UNDO_MS` – no confirm dialog needed.
 * - Every successful action notifies lists, buttons and counters (`friends:changed`).
 */
export const useFriendActions = () => {
  const { t } = useTranslation('friends');
  const { userMeta } = useAuth();
  const meId = userMeta?.id ?? null;

  /** Immediate action with optimistic UI. */
  const run = useCallback(
    async (action: FriendAction, otherId: string, task: Task, options: IRunOptions) => {
      const store = useFriendsStore.getState();
      if (!otherId || store.pending[otherId]) return false;
      store.setPending(otherId, action);
      store.adjustCounts(options.delta);
      try {
        if (!(await task())) throw new Error(`${action} was not successful`);
        // Lists remove the row in the same render in which `pending` is cleared → no flicker.
        emitFriendsChanged({ userId: otherId, action });
        if (options.successKey) toast.success(t(options.successKey, { name: options.name }));
        return true;
      } catch (error) {
        console.error('[friends]', action, error);
        useFriendsStore.getState().adjustCounts(invertDelta(options.delta));
        toast.error(t('errors.failed'));
        return false;
      } finally {
        useFriendsStore.getState().setPending(otherId, null);
      }
    },
    [t]
  );

  /** Reversible action: optimistic right away, sent after the undo window. */
  const runWithUndo = useCallback(
    (
      action: FriendAction,
      otherId: string,
      task: Task,
      options: IRunOptions & { successKey: string }
    ) => {
      const store = useFriendsStore.getState();
      if (!otherId || store.pending[otherId]) return;
      store.setPending(otherId, action);
      store.adjustCounts(options.delta);
      bindFlush();

      let settled = false;
      let timer = 0;
      const finish = () => {
        settled = true;
        window.clearTimeout(timer);
        deferred.delete(otherId);
      };

      const commit = async () => {
        if (settled) return;
        finish();
        try {
          if (!(await task())) throw new Error(`${action} was not successful`);
          emitFriendsChanged({ userId: otherId, action });
        } catch (error) {
          console.error('[friends]', action, error);
          useFriendsStore.getState().adjustCounts(invertDelta(options.delta));
          toast.error(t('errors.failed'));
        } finally {
          useFriendsStore.getState().setPending(otherId, null);
        }
      };

      const undo = () => {
        if (settled) return;
        finish();
        const current = useFriendsStore.getState();
        current.adjustCounts(invertDelta(options.delta));
        current.setPending(otherId, null);
      };

      timer = window.setTimeout(() => void commit(), FRIENDS_UNDO_MS);
      deferred.set(otherId, () => void commit());
      toast(t(options.successKey, { name: options.name }), {
        duration: FRIENDS_UNDO_MS,
        action: { label: t('actions.undo'), onClick: undo },
      });
    },
    [t]
  );

  return useMemo(
    () => ({
      meId,
      /** Send a friend request (backend notifies the other user). */
      request: (otherId: string, name: string) =>
        run('request', otherId, async () => Boolean((await FriendsApi.request(otherId))?.success), {
          delta: countDelta('request'),
          successKey: 'toast.requested',
          name,
        }),
      accept: (otherId: string, relation: IFriendRelation, name: string) =>
        run('accept', otherId, () => FriendsApi.accept(relation.relationId ?? ''), {
          delta: countDelta('accept'),
          successKey: 'toast.accepted',
          name,
        }),
      /** Decline a received request (undo window). */
      reject: (otherId: string, relation: IFriendRelation, name: string) =>
        runWithUndo('reject', otherId, () => FriendsApi.reject(relation.relationId ?? ''), {
          delta: countDelta('reject'),
          successKey: 'toast.rejected',
          name,
        }),
      /** Withdraw an own, still open request (undo window). */
      cancel: (otherId: string, relation: IFriendRelation, name: string) =>
        runWithUndo('cancel', otherId, () => FriendsApi.cancel(relation.relationId ?? ''), {
          delta: countDelta('cancel'),
          successKey: 'toast.canceled',
          name,
        }),
      /** End a friendship – same backend call as cancel (undo window). */
      remove: (otherId: string, relation: IFriendRelation, name: string) =>
        runWithUndo('remove', otherId, () => FriendsApi.cancel(relation.relationId ?? ''), {
          delta: countDelta('remove'),
          successKey: 'toast.removed',
          name,
        }),
      /** @param from List the user is in right now (keeps the counters correct). */
      block: (otherId: string, name: string, from?: FriendsFilter | null) =>
        run(
          'block',
          otherId,
          async () => Boolean(meId && (await FriendsApi.block(meId, otherId))?.success),
          { delta: countDelta('block', from), successKey: 'toast.blocked', name }
        ),
      unblock: (otherId: string, name: string) =>
        run(
          'unblock',
          otherId,
          async () => Boolean(meId && (await FriendsApi.unblock(meId, otherId))),
          { delta: countDelta('unblock'), successKey: 'toast.unblocked', name }
        ),
    }),
    [meId, run, runWithUndo]
  );
};
