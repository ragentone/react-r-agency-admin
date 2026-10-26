import { FriendsApi } from '@core/friends/api.ts';
import type { IFriendListItem } from '@core/friends/types.ts';
import { onFriendsChanged } from '@core/friends/utils.ts';
import { useEffect } from 'react';
import { create } from 'zustand';

/** Page size – the runtime allows at most 25 per request (user relation list). */
const FRIENDS_PAGE = 25;
/** Upper bound of loaded friends (20 requests). */
const FRIENDS_MAX = 500;
/** Reload the list at most this often while the messenger is used. */
const FRIENDS_TTL_MS = 60_000;

interface IFriendsCache {
  friends: IFriendListItem[] | null;
  failed: boolean;
  loadedAt: number;
  loading: boolean;
}

const useFriendsCache = create<IFriendsCache>(() => ({
  friends: null,
  failed: false,
  loadedAt: 0,
  loading: false,
}));

const load = async (force = false) => {
  const state = useFriendsCache.getState();
  if (state.loading || (!force && state.friends && Date.now() - state.loadedAt < FRIENDS_TTL_MS)) {
    return;
  }
  useFriendsCache.setState({ loading: true });
  try {
    const items: IFriendListItem[] = [];
    let total = Infinity;
    while (items.length < Math.min(total, FRIENDS_MAX)) {
      const page = await FriendsApi.list('accepted', FRIENDS_PAGE, items.length);
      total = page.total;
      items.push(...page.items);
      if (page.items.length < FRIENDS_PAGE) break;
    }
    const unique = Array.from(new Map(items.map(friend => [friend.id, friend])).values());
    useFriendsCache.setState({ friends: unique, failed: false, loadedAt: Date.now() });
  } catch (error) {
    console.warn('[messenger] friends failed', error);
    useFriendsCache.setState({ failed: true });
  } finally {
    useFriendsCache.setState({ loading: false });
  }
};

/** Accepted friends for search / "new message" (shared, short cache, reload on changes). */
export const useMessengerFriends = (enabled = true) => {
  const friends = useFriendsCache(state => state.friends);
  const failed = useFriendsCache(state => state.failed);

  useEffect(() => {
    if (!enabled) return;
    void load();
    return onFriendsChanged(() => void load(true));
  }, [enabled]);

  return { friends, failed, retry: () => void load(true) };
};

/** Search helper: alias contains the query (without a leading `@`, case-insensitive). */
export const matchesAlias = (alias: string, query: string) => {
  const q = query.trim().toLowerCase().replace(/^@/, '');
  return !q || alias.toLowerCase().includes(q);
};
