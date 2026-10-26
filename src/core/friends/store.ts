import { create } from 'zustand';

import { FriendsApi } from './api';
import type { FriendAction, FriendsFilter, IFriendsCounts } from './types';

const FILTERS: FriendsFilter[] = ['accepted', 'incoming', 'outgoing', 'blocked'];
const EMPTY: IFriendsCounts = { accepted: 0, incoming: 0, outgoing: 0, blocked: 0 };

interface IFriendsStore {
  /** Friends drawer (bottom sheet). */
  drawerOpen: boolean;
  /** Section to focus when opening (`outgoing` / `blocked` start expanded). */
  drawerTab: FriendsFilter;
  openDrawer: (focus?: FriendsFilter) => void;
  closeDrawer: () => void;
  counts: IFriendsCounts;
  loadedAt: number;
  /** Totals of all lists (one tiny request each). */
  refreshCounts: () => Promise<void>;
  /** Optimistic counter change (badge / section counts update instantly). */
  adjustCounts: (delta: Partial<IFriendsCounts>) => void;
  /**
   * Actions in flight (or waiting in their undo window), keyed by the other user's id.
   * Lists hide affected rows and buttons show the target state right away.
   */
  pending: Record<string, FriendAction>;
  setPending: (userId: string, action: FriendAction | null) => void;
  clear: () => void;
}

let inFlight: Promise<void> | null = null;

/** Counters for sections + menu badge (open requests) and the optimistic action state. */
export const useFriendsStore = create<IFriendsStore>((set, get) => ({
  drawerOpen: false,
  drawerTab: 'accepted',
  openDrawer: focus => set({ drawerOpen: true, drawerTab: focus ?? 'accepted' }),
  closeDrawer: () => set({ drawerOpen: false }),
  counts: EMPTY,
  loadedAt: 0,
  refreshCounts() {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        const totals = await Promise.all(FILTERS.map(filter => FriendsApi.list(filter, 1, 0)));
        const counts = { ...EMPTY };
        FILTERS.forEach((filter, i) => (counts[filter] = totals[i].total));
        set({ counts, loadedAt: Date.now() });
      } catch (error) {
        console.warn('[friends] counts failed', error);
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  },
  adjustCounts(delta) {
    const counts = { ...get().counts };
    for (const filter of FILTERS)
      counts[filter] = Math.max(0, counts[filter] + (delta[filter] ?? 0));
    set({ counts });
  },
  pending: {},
  setPending(userId, action) {
    const pending = { ...get().pending };
    if (action) pending[userId] = action;
    else delete pending[userId];
    set({ pending });
  },
  clear: () => set({ counts: EMPTY, loadedAt: 0, pending: {} }),
}));

/** Pending action towards one user (or undefined). */
export const usePendingFriendAction = (userId: string | null | undefined) =>
  useFriendsStore(state => (userId ? state.pending[userId] : undefined));
