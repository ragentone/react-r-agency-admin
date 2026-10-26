export type NotifyType = 'info' | 'success' | 'warning' | 'error';
export type NotifyFilter = 'all' | 'unread';

export interface INotifyFrom {
  id: string;
  alias: string;
  avatarUrl?: string | null;
}

/** Button of a notification – `emit` is handled by `NotifyActions` (see actions.ts). */
export interface INotifyAction {
  label: string;
  emit: string;
  payload?: Record<string, unknown> | null;
  variant?: 'destructive' | 'default' | 'secondary' | 'ghost' | 'link' | 'outline' | null;
  /** Close the drawer after the action. */
  close?: boolean | string | null;
  /** Delete the notification after the action succeeded. */
  delete?: boolean | null;
}

/** Normalized notification (listing record or live websocket notify). */
export interface INotifyItem {
  id: string;
  title?: string | null;
  message: string;
  type: NotifyType;
  /** ISO date. */
  date: string;
  from?: INotifyFrom | null;
  actions: INotifyAction[];
  seen: boolean;
  removable: boolean;
  translate: boolean;
  args: Record<string, unknown>;
  component?: string | null;
  identifier?: string | null;
  /** Live only, not stored (not in the inbox). */
  flash: boolean;
}

export interface INotifyState {
  total: number;
  unread: number;
  hasNew: boolean;
}

/** Raw record as the runtime sends it (listing: `payload`, websocket: `args` + `notifyId`). */
export interface INotifyRaw {
  notifyId?: string | null;
  title?: string | null;
  message?: string | null;
  type?: string | null;
  date?: string | null;
  from?: INotifyFrom | null;
  actions?: INotifyAction[] | null;
  seen?: boolean | null;
  removable?: boolean | null;
  translate?: boolean | null;
  args?: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
  component?: string | null;
  identifier?: string | null;
  flash?: boolean | null;
}

/** Payload of `user::update:notify_state` (all devices of the user). */
export interface INotifyStateEvent {
  state?: Partial<INotifyState> | null;
  seenIds?: string[] | null;
  seenAll?: boolean | null;
  removedIds?: string[] | null;
  cleared?: boolean | null;
}

export interface INotifyList {
  items: INotifyItem[];
  page: number;
  total: number;
  hasMore: boolean;
  loaded: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
}
