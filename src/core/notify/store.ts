import { create } from 'zustand';

import { useNotifyActivityUnseen } from './activity';
import { NotifyApi } from './api';
import { NOTIFY_PAGE_SIZE, NOTIFY_UNDO_MS } from './const';
import type {
  INotifyItem,
  INotifyList,
  INotifyRaw,
  INotifyState,
  INotifyStateEvent,
  NotifyFilter,
} from './types';
import { normalizeNotify, normalizeState } from './utils';

const FILTERS: NotifyFilter[] = ['all', 'unread'];
const EMPTY_STATE: INotifyState = { total: 0, unread: 0, hasNew: false };

const emptyList = (): INotifyList => ({
  items: [],
  page: 0,
  total: 0,
  hasMore: false,
  loaded: false,
  loading: false,
  loadingMore: false,
  error: null,
});

const emptyLists = (): Record<NotifyFilter, INotifyList> => ({
  all: emptyList(),
  unread: emptyList(),
});

const toError = (error: unknown) => (error instanceof Error ? error : new Error(String(error)));

interface INotifyStore {
  /** Notification drawer (bottom sheet). */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  /** Active tab of the drawer. */
  filter: NotifyFilter;
  setFilter: (filter: NotifyFilter) => void;

  /** Counters (badge). */
  state: INotifyState;
  stateLoadedAt: number;
  refreshState: () => Promise<void>;
  setState: (state: Partial<INotifyState> | null | undefined) => void;

  /** One paged list per tab. */
  lists: Record<NotifyFilter, INotifyList>;
  /** First page (again). */
  load: (filter: NotifyFilter) => Promise<void>;
  /** Next page (infinite scroll). */
  loadMore: (filter: NotifyFilter) => Promise<void>;

  /** Deleted, but still in the undo window → hidden in the lists. */
  hidden: Record<string, true>;
  /** Action of a notification in flight (spinner on that button), keyed by notify id. */
  busy: Record<string, string>;
  setBusy: (id: string, emit: string | null) => void;

  markSeen: (id: string) => Promise<void>;
  markAllSeen: () => Promise<void>;
  /**
   * Hides the notification at once and deletes it after the undo window.
   * Returns `undo` (restores it, nothing is sent) – `immediate` skips the window.
   */
  remove: (id: string, immediate?: boolean) => () => void;
  clearAll: () => Promise<boolean>;

  /** Live: new notification from the websocket → returns the normalized item. */
  receive: (raw: INotifyRaw) => INotifyItem | null;
  /** Live: counters / seen / removed changed (also from other devices). */
  applyStateEvent: (event: INotifyStateEvent) => void;
  /** Live: notification removed by the runtime (e.g. friend request withdrawn). */
  applyRemoved: (ids: string[]) => void;

  reset: () => void;
}

let stateInFlight: Promise<void> | null = null;
/** Bumped by `load` / `reset` – responses of older requests are dropped. */
const generation: Record<NotifyFilter, number> = { all: 0, unread: 0 };
/** Pending deletes (undo window). */
const deleteTimers = new Map<string, number>();

/** Notification center state: counters, paged lists, optimistic changes. */
export const useNotifyStore = create<INotifyStore>((set, get) => {
  /** Applies `fn` to every item of both lists. */
  const mapItems = (fn: (item: INotifyItem) => INotifyItem) => {
    const lists = { ...get().lists };
    for (const filter of FILTERS) {
      lists[filter] = { ...lists[filter], items: lists[filter].items.map(fn) };
    }
    set({ lists });
  };

  /** Removes items from both lists (total of each list adjusted). */
  const dropItems = (predicate: (item: INotifyItem) => boolean) => {
    const lists = { ...get().lists };
    for (const filter of FILTERS) {
      const list = lists[filter];
      const items = list.items.filter(item => !predicate(item));
      const removed = list.items.length - items.length;
      if (removed > 0) {
        lists[filter] = { ...list, items, total: Math.max(0, list.total - removed) };
      }
    }
    set({ lists });
  };

  const findItem = (id: string) =>
    get().lists.all.items.find(item => item.id === id) ??
    get().lists.unread.items.find(item => item.id === id);

  const adjustState = (delta: { total?: number; unread?: number }) => {
    const current = get().state;
    get().setState({
      total: current.total + (delta.total ?? 0),
      unread: current.unread + (delta.unread ?? 0),
    });
  };

  const fetchPage = async (filter: NotifyFilter, page: number) => {
    const ticket = generation[filter];
    const result = await NotifyApi.listing(page, NOTIFY_PAGE_SIZE, filter);
    if (ticket !== generation[filter]) return null;
    if (result.state) get().setState(result.state);
    return result;
  };

  return {
    drawerOpen: false,
    openDrawer: () => set({ drawerOpen: true }),
    closeDrawer: () => set({ drawerOpen: false }),

    filter: 'all',
    setFilter: filter => set({ filter }),

    state: EMPTY_STATE,
    stateLoadedAt: 0,
    refreshState() {
      if (stateInFlight) return stateInFlight;
      stateInFlight = (async () => {
        try {
          get().setState(await NotifyApi.state());
        } catch (error) {
          console.warn('[notify] state failed', error);
        } finally {
          stateInFlight = null;
        }
      })();
      return stateInFlight;
    },
    setState(state) {
      set({ state: normalizeState(state), stateLoadedAt: Date.now() });
    },

    lists: emptyLists(),
    async load(filter) {
      generation[filter] += 1;
      const lists = get().lists;
      set({
        lists: { ...lists, [filter]: { ...lists[filter], loading: true, error: null } },
      });
      try {
        const result = await fetchPage(filter, 1);
        if (!result) return;
        set({
          lists: {
            ...get().lists,
            [filter]: {
              ...emptyList(),
              items: result.items,
              page: 1,
              total: result.total,
              hasMore: result.hasMore,
              loaded: true,
            },
          },
        });
      } catch (error) {
        const current = get().lists;
        set({
          lists: {
            ...current,
            [filter]: { ...current[filter], loading: false, loaded: true, error: toError(error) },
          },
        });
      }
    },
    async loadMore(filter) {
      const list = get().lists[filter];
      if (!list.loaded || !list.hasMore || list.loading || list.loadingMore) return;
      set({
        lists: { ...get().lists, [filter]: { ...list, loadingMore: true, error: null } },
      });
      try {
        // Deleted / live-added items shift the pages – skip ids we already have.
        const result = await fetchPage(filter, list.page + 1);
        if (!result) return;
        const current = get().lists[filter];
        const known = new Set(current.items.map(item => item.id));
        set({
          lists: {
            ...get().lists,
            [filter]: {
              ...current,
              items: [...current.items, ...result.items.filter(item => !known.has(item.id))],
              page: list.page + 1,
              total: result.total,
              hasMore: result.hasMore,
              loadingMore: false,
            },
          },
        });
      } catch (error) {
        const current = get().lists[filter];
        set({
          lists: {
            ...get().lists,
            [filter]: { ...current, loadingMore: false, error: toError(error) },
          },
        });
      }
    },

    hidden: {},
    busy: {},
    setBusy(id, emit) {
      const busy = { ...get().busy };
      if (emit) busy[id] = emit;
      else delete busy[id];
      set({ busy });
    },

    async markSeen(id) {
      const item = findItem(id);
      if (!item) {
        // Not loaded (e.g. tap on a system notification) → only the backend + counters.
        try {
          const state = await NotifyApi.seen(id);
          if (state) get().setState(state);
        } catch (error) {
          console.warn('[notify] seen failed', error);
        }
        return;
      }
      if (item.seen) return;
      mapItems(entry => (entry.id === id ? { ...entry, seen: true } : entry));
      adjustState({ unread: -1 });
      try {
        const state = await NotifyApi.seen(id);
        if (state) get().setState(state);
      } catch (error) {
        console.warn('[notify] seen failed', error);
        mapItems(entry => (entry.id === id ? { ...entry, seen: false } : entry));
        adjustState({ unread: 1 });
      }
    },

    async markAllSeen() {
      const before = get().lists;
      const unread = get().state.unread;
      if (unread === 0 && !before.all.items.some(item => !item.seen)) return;
      mapItems(entry => (entry.seen ? entry : { ...entry, seen: true }));
      get().setState({ ...get().state, unread: 0 });
      try {
        const state = await NotifyApi.seenAll();
        if (state) get().setState(state);
      } catch (error) {
        console.warn('[notify] seen all failed', error);
        set({ lists: before });
        void get().refreshState();
        throw error;
      }
    },

    remove(id, immediate = false) {
      const item = findItem(id);
      if (!item || !item.removable || get().hidden[id]) return () => undefined;

      set({ hidden: { ...get().hidden, [id]: true } });
      adjustState({ total: -1, unread: item.seen ? 0 : -1 });

      const unhide = () => {
        const hidden = { ...get().hidden };
        delete hidden[id];
        set({ hidden });
      };

      const commit = async () => {
        deleteTimers.delete(id);
        try {
          const state = await NotifyApi.remove(id);
          dropItems(entry => entry.id === id);
          unhide();
          if (state) get().setState(state);
        } catch (error) {
          // Usually: already removed by the runtime (e.g. request answered) → reload the
          // truth instead of showing the entry again.
          console.warn('[notify] delete failed', error);
          unhide();
          void get().refreshState();
          FILTERS.forEach(filter => {
            if (get().lists[filter].loaded) void get().load(filter);
          });
        }
      };

      if (immediate) {
        void commit();
        return () => undefined;
      }

      deleteTimers.set(
        id,
        window.setTimeout(() => void commit(), NOTIFY_UNDO_MS)
      );
      return () => {
        const timer = deleteTimers.get(id);
        if (timer === undefined) return;
        window.clearTimeout(timer);
        deleteTimers.delete(id);
        unhide();
        adjustState({ total: 1, unread: item.seen ? 0 : 1 });
      };
    },

    async clearAll() {
      const before = get().lists;
      dropItems(item => item.removable);
      try {
        const state = await NotifyApi.clear();
        if (state) get().setState(state);
        return true;
      } catch (error) {
        console.warn('[notify] clear failed', error);
        set({ lists: before });
        void get().refreshState();
        return false;
      }
    },

    receive(raw) {
      const item = normalizeNotify(raw);
      if (!item || item.flash) return item;
      const lists = { ...get().lists };
      for (const filter of FILTERS) {
        const list = lists[filter];
        if (!list.loaded || list.items.some(entry => entry.id === item.id)) continue;
        lists[filter] = { ...list, items: [item, ...list.items], total: list.total + 1 };
      }
      set({ lists });
      // The runtime sends the exact counters right after (`user::update:notify_state`).
      adjustState({ total: 1, unread: item.seen ? 0 : 1 });
      return item;
    },

    applyStateEvent(event) {
      if (event.seenAll) {
        mapItems(entry => (entry.seen ? entry : { ...entry, seen: true }));
      } else if (event.seenIds?.length) {
        const ids = new Set(event.seenIds);
        mapItems(entry => (ids.has(entry.id) ? { ...entry, seen: true } : entry));
      }
      if (event.cleared) {
        dropItems(entry => entry.removable);
      } else if (event.removedIds?.length) {
        get().applyRemoved(event.removedIds);
      }
      if (event.state) get().setState(event.state);
    },

    applyRemoved(ids) {
      const set_ = new Set(ids);
      dropItems(entry => set_.has(entry.id));
    },

    reset() {
      FILTERS.forEach(filter => (generation[filter] += 1));
      deleteTimers.forEach(timer => window.clearTimeout(timer));
      deleteTimers.clear();
      set({
        drawerOpen: false,
        filter: 'all',
        state: EMPTY_STATE,
        stateLoadedAt: 0,
        lists: emptyLists(),
        hidden: {},
        busy: {},
      });
    },
  };
});

/** Unread counter (badge). */
export const useNotifyUnread = () => useNotifyStore(state => state.state.unread);

/** Bell badge: unread notifications + unseen live activities (see activity.ts). */
export const useNotifyBadge = () => {
  const unread = useNotifyUnread();
  const activities = useNotifyActivityUnseen();
  return unread + activities;
};
