/** 1:1 messenger between friends – backend: runtime src/shared/messenger (ws `messenger`). */

export type MessengerError =
  | 'unauthorized'
  | 'invalid_target'
  | 'not_friends'
  | 'empty'
  | 'too_long'
  | 'rate_limited'
  | 'not_found'
  | 'forbidden'
  | 'unavailable'
  | 'timeout';

export interface IMessengerUser {
  id: string;
  alias: string;
  avatarUrl: string | null;
  online?: boolean;
}

export interface IMessengerMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  deleted: boolean;
  clientKey?: string | null;
}

/** Message in the client: optimistic ones are `sending` until the runtime confirms them. */
export interface IMessengerLocalMessage extends IMessengerMessage {
  status?: 'sending' | 'failed';
}

export interface IMessengerConversation {
  id: string;
  peer: IMessengerUser;
  lastMessage: IMessengerMessage | null;
  unread: number;
  updatedAt: string;
}

export interface IMessengerThread {
  conversationId: string | null;
  messages: IMessengerLocalMessage[];
  hasMore: boolean;
  loaded: boolean;
  loading: boolean;
  loadingOlder: boolean;
  error: MessengerError | null;
}

export interface IMessengerLiveEvents {
  'messenger:message': { message: IMessengerMessage; peer: IMessengerUser };
  'messenger:read': { conversationId: string; readerId: string; readAt: string };
  'messenger:typing': { userId: string; typing: boolean };
  'messenger:deleted': { conversationId: string; messageId: string };
  'messenger:cleared': { conversationId: string; peerId: string };
}

export type MessengerAction =
  'conversations' | 'messages' | 'send' | 'read' | 'typing' | 'delete' | 'clear' | 'unread';

export interface IMessengerActionResult<T> {
  success: boolean;
  data?: T & { success?: boolean; error?: MessengerError };
}
