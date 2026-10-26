import { useAuthStore } from '@core/auth/auth.store.tsx';
import { create } from 'zustand';

import { messengerAction } from './api.ts';
import { MESSENGER_PAGE_SIZE, MESSENGER_TYPING_TTL_MS } from './const.ts';
import { isMessengerActive } from './feature.ts';
import type {
  IMessengerConversation,
  IMessengerLiveEvents,
  IMessengerLocalMessage,
  IMessengerMessage,
  IMessengerThread,
  IMessengerUser,
  MessengerError,
} from './types.ts';

const EMPTY_THREAD: IMessengerThread = {
  conversationId: null,
  messages: [],
  hasMore: false,
  loaded: false,
  loading: false,
  loadingOlder: false,
  error: null,
};

export const myId = () => useAuthStore.getState().userMeta?.id ?? null;

const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const byDate = (a: { createdAt: string }, b: { createdAt: string }) =>
  a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;

const sortConversations = (list: IMessengerConversation[]) =>
  [...list].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));

interface IMessengerStore {
  /** Messenger drawer. */
  open: boolean;
  /** Open chat (user id of the other side) – null = inbox. */
  activePeerId: string | null;
  /** "New message" picker (friends). */
  composing: boolean;
  openMessenger: (peer?: IMessengerUser | null) => void;
  closeMessenger: () => void;
  selectPeer: (peer: IMessengerUser | null) => void;
  setComposing: (composing: boolean) => void;

  /** Known users (alias, avatar, online) – from conversations, events, profile buttons. */
  users: Record<string, IMessengerUser>;
  rememberUser: (user: IMessengerUser) => void;
  setOnline: (userId: string, online: boolean) => void;

  conversations: IMessengerConversation[];
  conversationsLoaded: boolean;
  conversationsLoading: boolean;
  conversationsHasMore: boolean;
  loadConversations: (more?: boolean) => Promise<void>;

  unreadTotal: number;
  refreshUnread: () => Promise<void>;

  threads: Record<string, IMessengerThread>;
  loadThread: (peerId: string, force?: boolean) => Promise<void>;
  loadOlder: (peerId: string) => Promise<void>;
  send: (peerId: string, body: string) => Promise<MessengerError | null>;
  retry: (peerId: string, clientKey: string) => Promise<void>;
  discard: (peerId: string, clientKey: string) => void;
  markRead: (peerId: string) => Promise<void>;
  remove: (peerId: string, messageId: string) => Promise<boolean>;
  /** Deletes all messages of the chat – for both users. */
  clearChat: (peerId: string) => Promise<boolean>;

  /** userId → typing until (ms). */
  typing: Record<string, number>;

  // live events (runtime → client)
  onMessage: (payload: IMessengerLiveEvents['messenger:message']) => void;
  onRead: (payload: IMessengerLiveEvents['messenger:read']) => void;
  onTyping: (payload: IMessengerLiveEvents['messenger:typing']) => void;
  onDeleted: (payload: IMessengerLiveEvents['messenger:deleted']) => void;
  onCleared: (payload: IMessengerLiveEvents['messenger:cleared']) => void;

  clear: () => void;
}

let conversationsInFlight: Promise<void> | null = null;
const typingTimers = new Map<string, number>();

export const useMessengerStore = create<IMessengerStore>((set, get) => {
  const thread = (peerId: string) => get().threads[peerId] ?? EMPTY_THREAD;
  const patchThread = (peerId: string, patch: Partial<IMessengerThread>) =>
    set(state => ({
      threads: {
        ...state.threads,
        [peerId]: { ...(state.threads[peerId] ?? EMPTY_THREAD), ...patch },
      },
    }));
  const patchMessages = (
    peerId: string,
    fn: (messages: IMessengerLocalMessage[]) => IMessengerLocalMessage[]
  ) => {
    const current = get().threads[peerId];
    if (current) patchThread(peerId, { messages: fn(current.messages) });
  };

  /** Inserts / replaces a message (dedupe by id and clientKey). */
  const upsertMessage = (peerId: string, message: IMessengerLocalMessage) => {
    const current = get().threads[peerId];
    if (!current?.loaded) return;
    const messages = current.messages.filter(
      m => m.id !== message.id && !(message.clientKey && m.clientKey === message.clientKey)
    );
    messages.push(message);
    messages.sort(byDate);
    patchThread(peerId, {
      messages,
      conversationId: current.conversationId ?? message.conversationId,
    });
  };

  /** Moves the conversation to the top with its new last message. */
  const touchConversation = (
    peer: IMessengerUser,
    message: IMessengerMessage,
    unreadDelta: number
  ) => {
    const list = get().conversations;
    const existing = list.find(c => c.id === message.conversationId || c.peer.id === peer.id);
    const next: IMessengerConversation = existing
      ? {
          ...existing,
          id: message.conversationId,
          peer: { ...existing.peer, ...peer },
          lastMessage: message,
          unread: Math.max(0, existing.unread + unreadDelta),
          updatedAt: message.createdAt,
        }
      : {
          id: message.conversationId,
          peer,
          lastMessage: message,
          unread: Math.max(0, unreadDelta),
          updatedAt: message.createdAt,
        };
    set({
      conversations: sortConversations([next, ...list.filter(c => c !== existing)]),
    });
  };

  return {
    open: false,
    activePeerId: null,
    composing: false,
    openMessenger: peer => {
      if (peer) get().rememberUser(peer);
      // Without a user (menu, toast …) the messenger starts with the chat list.
      set({ open: true, activePeerId: peer?.id ?? null, composing: false });
    },
    closeMessenger: () => set({ open: false, composing: false }),
    selectPeer: peer => {
      if (peer) get().rememberUser(peer);
      set({ activePeerId: peer?.id ?? null, composing: false });
    },
    setComposing: composing => set({ composing }),

    users: {},
    rememberUser: user => {
      const known = get().users[user.id];
      const merged = {
        ...known,
        ...user,
        alias: user.alias || known?.alias || '',
        avatarUrl: user.avatarUrl ?? known?.avatarUrl ?? null,
        online: user.online ?? known?.online,
      };
      if (known && JSON.stringify(known) === JSON.stringify(merged)) return;
      set(state => ({ users: { ...state.users, [user.id]: merged } }));
    },
    setOnline: (userId, online) => {
      const known = get().users[userId];
      const inList = get().conversations.some(c => c.peer.id === userId);
      if (!known && !inList) return;
      set(state => ({
        users: known ? { ...state.users, [userId]: { ...known, online } } : state.users,
        conversations: inList
          ? state.conversations.map(c =>
              c.peer.id === userId ? { ...c, peer: { ...c.peer, online } } : c
            )
          : state.conversations,
      }));
    },

    conversations: [],
    conversationsLoaded: false,
    conversationsLoading: false,
    conversationsHasMore: false,
    loadConversations(more = false) {
      if (conversationsInFlight) return conversationsInFlight;
      conversationsInFlight = (async () => {
        set({ conversationsLoading: true });
        try {
          const offset = more ? get().conversations.length : 0;
          const result = await messengerAction<{
            conversations?: IMessengerConversation[];
            hasMore?: boolean;
          }>('conversations', { offset, limit: MESSENGER_PAGE_SIZE });
          if (!result.success) return;
          const list = result.data?.conversations ?? [];
          list.forEach(c => get().rememberUser(c.peer));
          const merged = more
            ? [
                ...get().conversations,
                ...list.filter(c => !get().conversations.some(o => o.id === c.id)),
              ]
            : list;
          set({
            conversations: sortConversations(merged),
            conversationsLoaded: true,
            conversationsHasMore: Boolean(result.data?.hasMore),
          });
        } finally {
          set({ conversationsLoading: false });
          conversationsInFlight = null;
        }
      })();
      return conversationsInFlight;
    },

    unreadTotal: 0,
    async refreshUnread() {
      const result = await messengerAction<{
        total?: number;
        conversations?: Record<string, number>;
      }>('unread');
      if (!result.success) return;
      const counts = result.data?.conversations ?? {};
      set(state => ({
        unreadTotal: result.data?.total ?? 0,
        conversations: state.conversations.map(c => ({ ...c, unread: counts[c.id] ?? 0 })),
      }));
    },

    threads: {},
    async loadThread(peerId, force = false) {
      const current = thread(peerId);
      if (current.loading || (current.loaded && !force)) return;
      patchThread(peerId, { loading: true, error: null });
      const result = await messengerAction<{
        peer?: IMessengerUser;
        conversationId?: string | null;
        messages?: IMessengerMessage[];
        hasMore?: boolean;
      }>('messages', { peerId, limit: MESSENGER_PAGE_SIZE });
      if (!result.success) {
        patchThread(peerId, { loading: false, error: result.data?.error ?? 'unavailable' });
        return;
      }
      if (result.data?.peer) get().rememberUser(result.data.peer);
      // Keep optimistic messages that are still on their way.
      const pending = thread(peerId).messages.filter(m => m.status);
      patchThread(peerId, {
        conversationId: result.data?.conversationId ?? null,
        messages: [...(result.data?.messages ?? []), ...pending].sort(byDate),
        hasMore: Boolean(result.data?.hasMore),
        loaded: true,
        loading: false,
        error: null,
      });
    },
    async loadOlder(peerId) {
      const current = thread(peerId);
      const first = current.messages.find(m => !m.status);
      if (!current.hasMore || current.loadingOlder || !first) return;
      patchThread(peerId, { loadingOlder: true });
      const result = await messengerAction<{ messages?: IMessengerMessage[]; hasMore?: boolean }>(
        'messages',
        { peerId, before: first.id, limit: MESSENGER_PAGE_SIZE }
      );
      const now = thread(peerId);
      if (!result.success) {
        patchThread(peerId, { loadingOlder: false });
        return;
      }
      const known = new Set(now.messages.map(m => m.id));
      patchThread(peerId, {
        messages: [...(result.data?.messages ?? []).filter(m => !known.has(m.id)), ...now.messages],
        hasMore: Boolean(result.data?.hasMore),
        loadingOlder: false,
      });
    },

    async send(peerId, body) {
      const me = myId();
      const text = body.trim();
      if (!me || !text) return 'empty';
      const clientKey = newKey();
      const local: IMessengerLocalMessage = {
        id: `local-${clientKey}`,
        clientKey,
        conversationId: thread(peerId).conversationId ?? '',
        senderId: me,
        recipientId: peerId,
        body: text,
        createdAt: new Date().toISOString(),
        readAt: null,
        deleted: false,
        status: 'sending',
      };
      if (!thread(peerId).loaded) patchThread(peerId, { loaded: true });
      upsertMessage(peerId, local);
      const result = await messengerAction<{ message?: IMessengerMessage }>('send', {
        peerId,
        body: text,
        clientKey,
      });
      const message = result.data?.message;
      if (!result.success || !message) {
        patchMessages(peerId, messages =>
          messages.map(m => (m.clientKey === clientKey ? { ...m, status: 'failed' } : m))
        );
        return result.data?.error ?? 'unavailable';
      }
      upsertMessage(peerId, { ...message, clientKey });
      const peer = get().users[peerId] ?? { id: peerId, alias: '', avatarUrl: null };
      touchConversation(peer, message, 0);
      return null;
    },
    async retry(peerId, clientKey) {
      const failed = thread(peerId).messages.find(m => m.clientKey === clientKey);
      if (!failed) return;
      get().discard(peerId, clientKey);
      await get().send(peerId, failed.body);
    },
    discard(peerId, clientKey) {
      patchMessages(peerId, messages => messages.filter(m => m.clientKey !== clientKey));
    },
    async markRead(peerId) {
      const conversation = get().conversations.find(c => c.peer.id === peerId);
      const me = myId();
      const hasUnread =
        (conversation?.unread ?? 0) > 0 ||
        thread(peerId).messages.some(m => m.recipientId === me && !m.readAt && !m.deleted);
      if (!hasUnread) return;
      // Optimistic: badge + list update right away.
      if (conversation?.unread) {
        set(state => ({
          unreadTotal: Math.max(0, state.unreadTotal - conversation.unread),
          conversations: state.conversations.map(c =>
            c === conversation ? { ...c, unread: 0 } : c
          ),
        }));
      }
      const readAt = new Date().toISOString();
      patchMessages(peerId, messages =>
        messages.map(m => (m.recipientId === me && !m.readAt ? { ...m, readAt } : m))
      );
      await messengerAction('read', { peerId });
    },
    async remove(peerId, messageId) {
      const result = await messengerAction('delete', { messageId });
      if (result.success) {
        const conversationId = thread(peerId).conversationId ?? '';
        get().onDeleted({ conversationId, messageId });
      }
      return result.success;
    },

    async clearChat(peerId) {
      const result = await messengerAction('clear', { peerId });
      if (result.success) {
        get().onCleared({ conversationId: thread(peerId).conversationId ?? '', peerId });
      }
      return result.success;
    },

    typing: {},

    onMessage({ message, peer }) {
      const me = myId();
      if (!me) return;
      get().rememberUser(peer);
      const incoming = message.recipientId === me;
      const { open, activePeerId } = get();
      const watching =
        incoming && open && activePeerId === peer.id && document.visibilityState === 'visible';
      upsertMessage(peer.id, message);
      touchConversation(peer, message, incoming && !watching ? 1 : 0);
      if (incoming) {
        // A message ends the typing indicator.
        get().onTyping({ userId: peer.id, typing: false });
        if (watching) void get().markRead(peer.id);
        else set(state => ({ unreadTotal: state.unreadTotal + 1 }));
      }
    },
    onRead({ conversationId, readerId, readAt }) {
      const me = myId();
      if (readerId === me) {
        // Read on another own device.
        const conversation = get().conversations.find(c => c.id === conversationId);
        if (conversation?.unread) {
          set(state => ({
            unreadTotal: Math.max(0, state.unreadTotal - conversation.unread),
            conversations: state.conversations.map(c =>
              c.id === conversationId ? { ...c, unread: 0 } : c
            ),
          }));
        }
        return;
      }
      // The friend read my messages → "seen".
      const peerId = readerId;
      patchMessages(peerId, messages =>
        messages.map(m =>
          m.senderId === me && !m.readAt && !m.status && m.createdAt <= readAt
            ? { ...m, readAt }
            : m
        )
      );
      set(state => ({
        conversations: state.conversations.map(c =>
          c.id === conversationId && c.lastMessage?.senderId === me && !c.lastMessage.readAt
            ? { ...c, lastMessage: { ...c.lastMessage, readAt } }
            : c
        ),
      }));
    },
    onTyping({ userId, typing }) {
      window.clearTimeout(typingTimers.get(userId));
      typingTimers.delete(userId);
      if (!typing) {
        if (!(userId in get().typing)) return;
        const next = { ...get().typing };
        delete next[userId];
        set({ typing: next });
        return;
      }
      set(state => ({
        typing: { ...state.typing, [userId]: Date.now() + MESSENGER_TYPING_TTL_MS },
      }));
      typingTimers.set(
        userId,
        window.setTimeout(() => get().onTyping({ userId, typing: false }), MESSENGER_TYPING_TTL_MS)
      );
    },
    onDeleted({ conversationId, messageId }) {
      const removed = (m: IMessengerMessage): IMessengerMessage =>
        m.id === messageId ? { ...m, deleted: true, body: '' } : m;
      set(state => ({
        threads: Object.fromEntries(
          Object.entries(state.threads).map(([peerId, t]) => [
            peerId,
            t.messages.some(m => m.id === messageId)
              ? { ...t, messages: t.messages.map(removed) }
              : t,
          ])
        ),
        conversations: state.conversations.map(c =>
          c.id === conversationId && c.lastMessage?.id === messageId
            ? { ...c, lastMessage: removed(c.lastMessage) }
            : c
        ),
      }));
    },

    onCleared({ conversationId, peerId }) {
      const conversation = get().conversations.find(
        c => c.peer.id === peerId || (conversationId && c.id === conversationId)
      );
      set(state => ({
        // Empty, fully loaded chat – the intro shows again.
        threads: {
          ...state.threads,
          [peerId]: {
            ...(state.threads[peerId] ?? EMPTY_THREAD),
            messages: (state.threads[peerId]?.messages ?? []).filter(m => m.status === 'sending'),
            hasMore: false,
            loaded: true,
            loading: false,
            loadingOlder: false,
          },
        },
        conversations: state.conversations.filter(c => c !== conversation),
        unreadTotal: Math.max(0, state.unreadTotal - (conversation?.unread ?? 0)),
      }));
    },

    clear() {
      typingTimers.forEach(timer => window.clearTimeout(timer));
      typingTimers.clear();
      set({
        open: false,
        activePeerId: null,
        composing: false,
        users: {},
        conversations: [],
        conversationsLoaded: false,
        conversationsHasMore: false,
        unreadTotal: 0,
        threads: {},
        typing: {},
      });
    },
  };
});

/** Opens the messenger (optionally directly with a chat) – usable outside React. */
export const openMessenger = (peer?: IMessengerUser | null) => {
  // Module disabled (config.json) → nothing renders the drawer.
  if (!isMessengerActive()) return;
  useMessengerStore.getState().openMessenger(peer);
};

/** User info of a chat partner (known users, then the conversation list). */
export const useMessengerUser = (userId: string | null) =>
  useMessengerStore(state =>
    userId
      ? (state.users[userId] ?? state.conversations.find(c => c.peer.id === userId)?.peer ?? null)
      : null
  );

export const useMessengerThread = (peerId: string | null) =>
  useMessengerStore(state => (peerId ? (state.threads[peerId] ?? EMPTY_THREAD) : EMPTY_THREAD));

export const useMessengerTyping = (peerId: string | null) =>
  useMessengerStore(state => Boolean(peerId && state.typing[peerId]));
