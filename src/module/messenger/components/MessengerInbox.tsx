import type { IFriendListItem } from '@core/friends/types.ts';
import { PushHint } from '@core/push/components/PushHint.tsx';
import { cn } from '@ui/lib/utils.ts';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Loader2, MessageCircle, Search, SquarePen, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MESSENGER_PRIMARY_COLOR } from '../const.ts';
import { matchesAlias, useMessengerFriends } from '../hooks';
import { myId, useMessengerStore } from '../store.ts';
import type { IMessengerConversation } from '../types.ts';
import { formatInboxTime } from '../utils.ts';
import { MessengerAvatar } from './MessengerAvatar.tsx';
import { MessengerHeaderButton } from './MessengerHeaderButton.tsx';

/** Chat list (Messenger "Chats"): search, conversations with preview, unread dot. */
export const MessengerInbox: React.FC = () => {
  const { t } = useTranslation('messenger');
  const conversations = useMessengerStore(state => state.conversations);
  const loaded = useMessengerStore(state => state.conversationsLoaded);
  const loading = useMessengerStore(state => state.conversationsLoading);
  const hasMore = useMessengerStore(state => state.conversationsHasMore);
  const loadConversations = useMessengerStore(state => state.loadConversations);
  const setComposing = useMessengerStore(state => state.setComposing);
  const closeMessenger = useMessengerStore(state => state.closeMessenger);
  const [query, setQuery] = useState('');

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const searching = query.trim().replace(/^@/, '').length > 0;
  // Friends are only loaded once the user searches.
  const { friends } = useMessengerFriends(searching);

  const filtered = useMemo(
    () =>
      searching ? conversations.filter(c => matchesAlias(c.peer.alias, query)) : conversations,
    [conversations, query, searching]
  );
  // Search: friends without a chat yet (like Messenger: "More people").
  const people = useMemo(() => {
    if (!searching || !friends) return [];
    const inChats = new Set(conversations.map(c => c.peer.id));
    return friends
      .filter(f => !inChats.has(f.id) && matchesAlias(f.alias, query))
      .sort((a, b) => Number(!!b.online) - Number(!!a.online) || a.alias.localeCompare(b.alias))
      .slice(0, 30);
  }, [searching, friends, conversations, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-2 px-4 pt-3 pb-2">
        <h2 className="min-w-0 flex-1 truncate text-2xl font-extrabold tracking-tight">
          {t('title')}
        </h2>
        <MessengerHeaderButton
          onClick={() => setComposing(true)}
          aria-label={t('newMessage')}
          title={t('newMessage')}
        >
          <SquarePen />
        </MessengerHeaderButton>
        <MessengerHeaderButton onClick={closeMessenger} aria-label={t('close')} title={t('close')}>
          <X />
        </MessengerHeaderButton>
      </header>

      <div className="shrink-0 px-4 pb-2">
        <label className="flex h-9 items-center gap-2 rounded-full bg-foreground/6 px-3 text-muted-foreground focus-within:ring-2 focus-within:ring-ring/40">
          <Search className="size-4 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none sm:text-body [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('clearSearch')}
              className="-mr-1 grid size-6 place-items-center rounded-full hover:bg-foreground/8"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      {/* "Turn on notifications" – only while the browser hasn't asked yet. */}
      <PushHint className="mx-4 mb-2 shrink-0" />

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {!loaded && loading ? (
          <InboxSkeleton />
        ) : searching ? (
          <SearchResults conversations={filtered} people={people} loadingPeople={!friends} />
        ) : filtered.length === 0 ? (
          query ? (
            <p className="px-4 py-10 text-center text-body text-muted-foreground">
              {t('inbox.noResults')}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <span
                className="grid size-16 place-items-center rounded-full text-white"
                style={{ background: MESSENGER_PRIMARY_COLOR }}
              >
                <MessageCircle className="size-8" />
              </span>
              <h3 className="text-title font-bold">{t('inbox.emptyTitle')}</h3>
              <p className="max-w-xs text-body text-muted-foreground">{t('inbox.emptyText')}</p>
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-85"
              >
                <SquarePen className="size-4" />
                {t('inbox.start')}
              </button>
            </div>
          )
        ) : (
          <ul className="flex flex-col">
            {filtered.map(conversation => (
              <li key={conversation.id}>
                <InboxItem conversation={conversation} />
              </li>
            ))}
          </ul>
        )}
        {hasMore && !query && (
          <div className="flex justify-center py-3">
            <button
              type="button"
              onClick={() => void loadConversations(true)}
              disabled={loading}
              className="inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-semibold text-foreground hover:bg-foreground/6 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {t('loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/** Search: matching chats, then friends without a chat (tap → opens a new chat). */
const SearchResults: React.FC<{
  conversations: IMessengerConversation[];
  people: IFriendListItem[];
  loadingPeople: boolean;
}> = ({ conversations, people, loadingPeople }) => {
  const { t } = useTranslation('messenger');
  const selectPeer = useMessengerStore(state => state.selectPeer);

  if (!conversations.length && !people.length) {
    return loadingPeople ? (
      <div className="flex justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    ) : (
      <p className="px-4 py-10 text-center text-body text-muted-foreground">
        {t('inbox.noResults')}
      </p>
    );
  }

  return (
    <>
      {conversations.length > 0 && (
        <>
          <h3 className="px-2 pt-1 pb-1 text-caption font-semibold text-muted-foreground">
            {t('inbox.chats')}
          </h3>
          <ul className="flex flex-col">
            {conversations.map(conversation => (
              <li key={conversation.id}>
                <InboxItem conversation={conversation} />
              </li>
            ))}
          </ul>
        </>
      )}
      {people.length > 0 && (
        <>
          <h3 className="px-2 pt-3 pb-1 text-caption font-semibold text-muted-foreground">
            {t('inbox.people')}
          </h3>
          <ul className="flex flex-col">
            {people.map(friend => (
              <li key={friend.id}>
                <button
                  type="button"
                  onClick={() =>
                    selectPeer({
                      id: friend.id,
                      alias: friend.alias,
                      avatarUrl: friend.avatarUrl ?? null,
                      online: friend.online,
                    })
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left outline-none transition-colors hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring active:bg-foreground/[0.06]"
                >
                  <MessengerAvatar
                    user={{
                      alias: friend.alias,
                      avatarUrl: friend.avatarUrl ?? null,
                      online: friend.online,
                    }}
                    className="size-11"
                    dotClassName="size-3"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium">{friend.alias}</span>
                    <span className="block truncate text-caption text-muted-foreground">
                      {t('inbox.startChat')}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

const InboxItem: React.FC<{ conversation: IMessengerConversation }> = ({ conversation }) => {
  const { t, i18n } = useTranslation('messenger');
  const me = myId();
  const peer = useMessengerStore(state => state.users[conversation.peer.id] ?? conversation.peer);
  const active = useMessengerStore(state => state.activePeerId === conversation.peer.id);
  const typing = useMessengerStore(state => Boolean(state.typing[conversation.peer.id]));
  const selectPeer = useMessengerStore(state => state.selectPeer);
  const last = conversation.lastMessage;
  const unread = conversation.unread > 0;
  const mine = last?.senderId === me;
  const name = peer.alias || t('unknown');

  const preview = typing
    ? t('chat.typing', { name: '' }).trim()
    : !last
      ? ''
      : last.deleted
        ? mine
          ? t('chat.deletedOwn')
          : t('chat.deleted')
        : `${mine ? `${t('you')}: ` : ''}${last.body.replace(/\s+/g, ' ')}`;

  return (
    <button
      type="button"
      onClick={() => selectPeer(peer)}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
        active ? 'bg-foreground/[0.07]' : 'hover:bg-foreground/4 active:bg-foreground/6'
      )}
    >
      <MessengerAvatar user={peer} className="size-14" />
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-body', unread ? 'font-bold' : 'font-medium')}>
          {name}
        </span>
        <span
          className={cn(
            'flex min-w-0 items-center gap-1 text-caption',
            unread ? 'font-bold text-foreground' : 'text-muted-foreground',
            typing && 'text-[#0084ff]'
          )}
        >
          <span className="min-w-0 truncate">{preview}</span>
          {last && !typing && (
            <span className="shrink-0">
              · {formatInboxTime(conversation.updatedAt, t, i18n.language)}
            </span>
          )}
        </span>
      </span>
      {unread ? (
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: MESSENGER_PRIMARY_COLOR }}
          aria-label={t('inbox.unread')}
          role="img"
        />
      ) : mine && last?.readAt && !last.deleted ? (
        // Messenger: tiny avatar = "seen".
        <MessengerAvatar user={peer} showOnline={false} className="size-4 text-[7px]" />
      ) : null}
    </button>
  );
};

const InboxSkeleton: React.FC = () => (
  <div className="flex flex-col gap-1 px-2 py-1" aria-hidden="true">
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} className="flex items-center gap-3 py-2">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/5 rounded-full" />
          <Skeleton className="h-3 w-3/5 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
