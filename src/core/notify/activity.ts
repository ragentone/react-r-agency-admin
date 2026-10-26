import type { ComponentType } from 'react';
import { create } from 'zustand';

/**
 * Live activities of the notification center (e.g. "post is being created").
 *
 * Client-only, not stored in the inbox: a running task shows up at the top of the drawer
 * with a progress bar instead of a toast. New / finished activities count towards the bell
 * badge until the drawer was opened; finished ones that were seen go away when it closes.
 */

export type NotifyActivityStatus = 'running' | 'done' | 'error';

export interface INotifyActivityAction {
  label: string;
  onSelect: () => void;
}

export interface INotifyActivity {
  id: string;
  /** Already translated. */
  title: string;
  message?: string | null;
  status: NotifyActivityStatus;
  /** 0 … 100 – `undefined` = indeterminate (running). */
  progress?: number;
  /** Icon while running (default: spinner). */
  icon?: ComponentType<{ className?: string }> | null;
  /** Main button, e.g. "View" once done (the drawer closes first). */
  action?: INotifyActivityAction | null;
  /** ISO date of the start. */
  date: string;
  /** Not seen in the drawer yet → badge + unread marker. */
  seen: boolean;
}

export type NotifyActivityPatch = Partial<Omit<INotifyActivity, 'id' | 'date' | 'seen'>> & {
  title?: string;
};

/** Safety net: a running activity without updates disappears after this time. */
const STALE_MS = 300_000;
/** Finished activities nobody looked at are dropped after this time. */
const DONE_TTL_MS = 30 * 60_000;

const timers = new Map<string, number>();

interface INotifyActivityStore {
  /** Newest first. */
  items: INotifyActivity[];
  /** Creates or updates an activity – a status change marks it unseen again. */
  upsert: (id: string, patch: NotifyActivityPatch) => void;
  remove: (id: string) => void;
  /** Drawer opened → everything visible counts as seen. */
  markAllSeen: () => void;
  /** Drawer closed → finished activities that were seen are done with. */
  pruneSeen: () => void;
  has: (id: string) => boolean;
  reset: () => void;
}

const clearTimer = (id: string) => {
  const timer = timers.get(id);
  if (timer !== undefined) window.clearTimeout(timer);
  timers.delete(id);
};

export const useNotifyActivityStore = create<INotifyActivityStore>((set, get) => {
  const schedule = (id: string, ms: number) => {
    clearTimer(id);
    timers.set(
      id,
      window.setTimeout(() => get().remove(id), ms)
    );
  };

  return {
    items: [],

    upsert(id, patch) {
      const items = get().items;
      const current = items.find(item => item.id === id);
      const status = patch.status ?? current?.status ?? 'running';
      const next: INotifyActivity = {
        id,
        title: patch.title ?? current?.title ?? '',
        message: patch.message !== undefined ? patch.message : current?.message,
        status,
        progress: patch.progress !== undefined ? patch.progress : current?.progress,
        icon: patch.icon !== undefined ? patch.icon : current?.icon,
        action: patch.action !== undefined ? patch.action : current?.action,
        date: current?.date ?? new Date().toISOString(),
        // New or finished → show up on the badge again.
        seen: current ? current.seen && current.status === status : false,
      };
      set({
        items: current ? items.map(item => (item.id === id ? next : item)) : [next, ...items],
      });
      schedule(id, status === 'running' ? STALE_MS : DONE_TTL_MS);
    },

    remove(id) {
      clearTimer(id);
      if (!get().items.some(item => item.id === id)) return;
      set({ items: get().items.filter(item => item.id !== id) });
    },

    markAllSeen() {
      if (get().items.every(item => item.seen)) return;
      set({ items: get().items.map(item => (item.seen ? item : { ...item, seen: true })) });
    },

    pruneSeen() {
      const keep = get().items.filter(item => item.status === 'running' || !item.seen);
      if (keep.length === get().items.length) return;
      get()
        .items.filter(item => !keep.includes(item))
        .forEach(item => clearTimer(item.id));
      set({ items: keep });
    },

    has: id => get().items.some(item => item.id === id),

    reset() {
      timers.forEach(timer => window.clearTimeout(timer));
      timers.clear();
      set({ items: [] });
    },
  };
});

/** Imperative API for apps (no hook needed, e.g. from websocket handlers). */
export const NotifyActivity = {
  upsert: (id: string, patch: NotifyActivityPatch) =>
    useNotifyActivityStore.getState().upsert(id, patch),
  remove: (id: string) => useNotifyActivityStore.getState().remove(id),
  has: (id: string) => useNotifyActivityStore.getState().has(id),
  /** Ids of the running activities (newest first). */
  running: () =>
    useNotifyActivityStore
      .getState()
      .items.filter(item => item.status === 'running')
      .map(item => item.id),
};

/** Unseen activities (part of the bell badge). */
export const useNotifyActivityUnseen = () =>
  useNotifyActivityStore(state => state.items.filter(item => !item.seen).length);

/** Something is running right now. */
export const useNotifyActivityRunning = () =>
  useNotifyActivityStore(state => state.items.some(item => item.status === 'running'));
