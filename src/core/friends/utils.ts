import type {
  FriendAction,
  FriendsFilter,
  FriendState,
  IFriendPresence,
  IFriendRelation,
  IFriendsChange,
  IFriendsCounts,
} from './types';

/** What the viewer (`meId`) can do with the other user, based on the relation. */
export const getFriendState = (
  relation: IFriendRelation | null | undefined,
  meId: string | null | undefined
): FriendState => {
  const status = relation?.status;
  if (!relation || !status || status === 'rejected') return 'none';
  if (status === 'accepted') return 'friends';
  if (status === 'blocked') return relation.blockedBy === meId ? 'blocked' : 'blockedByOther';
  return relation.requestBy === meId ? 'outgoing' : 'incoming';
};

/** State the relation will have once `action` went through – used for optimistic UI. */
export const FRIEND_STATE_AFTER: Record<FriendAction, FriendState> = {
  request: 'outgoing',
  cancel: 'none',
  accept: 'friends',
  reject: 'none',
  remove: 'none',
  block: 'blocked',
  unblock: 'none',
};

/** Lists a user disappears from once `action` went through. */
const REMOVES_FROM: Record<FriendAction, FriendsFilter[]> = {
  request: [],
  cancel: ['outgoing'],
  accept: ['incoming'],
  reject: ['incoming'],
  remove: ['accepted'],
  block: ['accepted', 'incoming', 'outgoing'],
  unblock: ['blocked'],
};

export const removesFrom = (action: FriendAction | null | undefined, filter: FriendsFilter) =>
  Boolean(action && REMOVES_FROM[action].includes(filter));

/** Optimistic counter change of an action (`from` = list the user was in, for `block`). */
export const countDelta = (
  action: FriendAction,
  from?: FriendsFilter | null
): Partial<IFriendsCounts> => {
  switch (action) {
    case 'request':
      return { outgoing: 1 };
    case 'cancel':
      return { outgoing: -1 };
    case 'accept':
      return { incoming: -1, accepted: 1 };
    case 'reject':
      return { incoming: -1 };
    case 'remove':
      return { accepted: -1 };
    case 'unblock':
      return { blocked: -1 };
    case 'block':
      return from && from !== 'blocked' ? { blocked: 1, [from]: -1 } : { blocked: 1 };
  }
};

export const invertDelta = (delta: Partial<IFriendsCounts>): Partial<IFriendsCounts> =>
  Object.fromEntries(Object.entries(delta).map(([key, value]) => [key, -(value ?? 0)]));

/** List a user is in, derived from the relation state (for counter updates). */
export const filterOfState = (state: FriendState): FriendsFilter | null => {
  switch (state) {
    case 'friends':
      return 'accepted';
    case 'incoming':
      return 'incoming';
    case 'outgoing':
      return 'outgoing';
    case 'blocked':
      return 'blocked';
    default:
      return null;
  }
};

/** "2 hours ago" for recent dates, a short date otherwise. */
export const formatRelativeDate = (iso: string | null | undefined, locale?: string) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const seconds = (date.getTime() - Date.now()) / 1000;
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (abs < 60) return rtf.format(0, 'second');
  if (abs < 3_600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(seconds / 3_600), 'hour');
  if (abs < 7 * 86_400) return rtf.format(Math.round(seconds / 86_400), 'day');
  if (abs < 30 * 86_400) return rtf.format(Math.round(seconds / (7 * 86_400)), 'week');
  return formatShortDate(iso, locale);
};

export const formatShortDate = (iso: string | null | undefined, locale?: string) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  }).format(date);
};

/** Tiny event bus: lists / buttons / counters refresh after a relation changed anywhere. */
const target = new EventTarget();
const CHANGED = 'friends:changed';

/** `string` (user id) is still accepted for older call sites. */
export const emitFriendsChanged = (change?: IFriendsChange | string) =>
  target.dispatchEvent(
    new CustomEvent<IFriendsChange>(CHANGED, {
      detail: typeof change === 'string' ? { userId: change } : (change ?? {}),
    })
  );

export const onFriendsChanged = (fn: (change: IFriendsChange) => void) => {
  const listener = (event: Event) => fn((event as CustomEvent<IFriendsChange>).detail ?? {});
  target.addEventListener(CHANGED, listener);
  return () => target.removeEventListener(CHANGED, listener);
};

const PRESENCE = 'friends:presence';

/** A friend came online / went offline (live, from the websocket). */
export const emitFriendPresence = (presence: IFriendPresence) =>
  target.dispatchEvent(new CustomEvent<IFriendPresence>(PRESENCE, { detail: presence }));

export const onFriendPresence = (fn: (presence: IFriendPresence) => void) => {
  const listener = (event: Event) => fn((event as CustomEvent<IFriendPresence>).detail);
  target.addEventListener(PRESENCE, listener);
  return () => target.removeEventListener(PRESENCE, listener);
};
