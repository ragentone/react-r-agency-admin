import { startCall } from '@core/call/call.engine.ts';
import { primeRingAudio } from '@core/call/ringer.ts';
import { NotifyItemMenu } from '@core/notify/components/NotifyItemMenu.tsx';
import { openProfileDrawer } from '@core/profile/hooks/use.profile.drawer.ts';
import { cn } from '@ui/lib/utils.ts';
import { useIsMobile } from '@ui/shad-cn/hooks/use-mobile.ts';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  Copy,
  Loader2,
  MessageCircleX,
  Phone,
  RotateCw,
  Trash2,
  Undo2,
  Video,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  myId,
  useMessengerStore,
  useMessengerThread,
  useMessengerTyping,
  useMessengerUser,
} from '../store.ts';
import type { IMessengerLocalMessage, IMessengerUser } from '../types.ts';
import { buildRows, formatFullTime, formatSeparator } from '../utils.ts';
import { MessengerAvatar } from './MessengerAvatar.tsx';
import { MessengerBubble } from './MessengerBubble.tsx';
import { MessengerClearDialog } from './MessengerClearDialog.tsx';
import { MessengerComposer } from './MessengerComposer.tsx';
import { MessengerHeaderButton } from './MessengerHeaderButton.tsx';
import { MessengerTypingBubble } from './MessengerTypingBubble.tsx';

/** Distance to the bottom (px) that still counts as "at the end" → new messages scroll in. */
const STICK_PX = 120;

/** One chat (Messenger): header with calls, bubbles, seen / typing, composer. */
export const MessengerChat: React.FC<{ peerId: string }> = ({ peerId }) => {
  const { t, i18n } = useTranslation('messenger');
  const mobile = useIsMobile();
  const me = myId();
  const user = useMessengerUser(peerId);
  const thread = useMessengerThread(peerId);
  const typing = useMessengerTyping(peerId);
  const store = useMessengerStore.getState;
  const selectPeer = useMessengerStore(state => state.selectPeer);
  const closeMessenger = useMessengerStore(state => state.closeMessenger);
  const peer: IMessengerUser = user ?? { id: peerId, alias: '', avatarUrl: null };
  const name = peer.alias || t('unknown');
  const notFriends = thread.error === 'not_friends';
  const loadFailed = !!thread.error && !notFriends && !thread.loaded;

  const scrollRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const anchor = useRef<{ firstId: string | null; height: number; top: number }>({
    firstId: null,
    height: 0,
    top: 0,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const canClear = thread.messages.some(m => !m.status);

  const clearChat = async () => {
    setConfirmClear(false);
    const ok = await store().clearChat(peerId);
    if (ok) toast.success(t('chat.cleared'));
    else toast.error(t('chat.clearFailed'));
  };

  useEffect(() => {
    void store().loadThread(peerId);
  }, [peerId, store]);

  // Open chat → read (also when new messages arrive while it is open).
  const unreadIncoming = thread.messages.some(m => m.recipientId === me && !m.readAt && !m.deleted);
  useEffect(() => {
    if (thread.loaded && unreadIncoming && document.visibilityState === 'visible') {
      void store().markRead(peerId);
    }
  }, [thread.loaded, unreadIncoming, peerId, store]);

  // Older messages when the top comes into view.
  useEffect(() => {
    const el = topRef.current;
    const root = scrollRef.current;
    if (!el || !root || !thread.hasMore) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          const box = scrollRef.current;
          anchor.current = {
            firstId: thread.messages[0]?.id ?? null,
            height: box?.scrollHeight ?? 0,
            top: box?.scrollTop ?? 0,
          };
          void store().loadOlder(peerId);
        }
      },
      { root, rootMargin: '200px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [thread.hasMore, thread.messages, peerId, store]);

  // Keep the position when older messages were added on top, otherwise follow new ones.
  const lastId = thread.messages[thread.messages.length - 1]?.id;
  const firstId = thread.messages[0]?.id;
  const initial = useRef(true);
  useLayoutEffect(() => {
    const box = scrollRef.current;
    if (!box || !thread.loaded) return;
    if (anchor.current.firstId && anchor.current.firstId !== firstId) {
      box.scrollTop = box.scrollHeight - anchor.current.height + anchor.current.top;
      anchor.current.firstId = null;
      return;
    }
    const lastMine = thread.messages[thread.messages.length - 1]?.senderId === me;
    if (initial.current || stick.current || lastMine) {
      box.scrollTo({ top: box.scrollHeight, behavior: initial.current ? 'auto' : 'smooth' });
      initial.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.loaded, lastId, firstId, typing]);

  const onScroll = () => {
    const box = scrollRef.current;
    if (box) stick.current = box.scrollHeight - box.scrollTop - box.clientHeight < STICK_PX;
  };

  const separator = useCallback(
    (iso: string) => formatSeparator(iso, t, i18n.language),
    [t, i18n.language]
  );
  const rows = useMemo(
    () => buildRows(thread.messages, me, separator),
    [thread.messages, me, separator]
  );
  // "Seen": tiny avatar under the last own message the friend has read.
  const lastReadOwnId = useMemo(
    () => [...thread.messages].reverse().find(m => m.senderId === me && m.readAt && !m.status)?.id,
    [thread.messages, me]
  );
  const lastMessage = thread.messages[thread.messages.length - 1];

  const call = (video: boolean) => {
    primeRingAudio();
    void startCall({ id: peer.id, alias: peer.alias, avatarUrl: peer.avatarUrl }, video);
  };

  const actionsOf = (message: IMessengerLocalMessage, mine: boolean) => {
    if (message.deleted || message.status) return [];
    const items = [
      {
        key: 'copy',
        label: t('chat.copy'),
        icon: Copy,
        onSelect: () => {
          void navigator.clipboard?.writeText(message.body).then(
            () => toast.success(t('chat.copied')),
            () => undefined
          );
        },
      },
    ];
    if (mine) {
      items.push({
        key: 'unsend',
        label: t('chat.unsend'),
        icon: Undo2,
        destructive: true,
        onSelect: () => {
          void store()
            .remove(peerId, message.id)
            .then(ok => !ok && toast.error(t('chat.unsendFailed')));
        },
      } as (typeof items)[number]);
    }
    return items;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* ---- header ---- */}
      <header className="flex shrink-0 items-center gap-1 border-b border-border/60 px-2 py-2 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
        {mobile && (
          <MessengerHeaderButton
            tone="plain"
            onClick={() => selectPeer(null)}
            aria-label={t('back')}
            title={t('back')}
            className="[&_svg]:size-7"
          >
            <ChevronLeft />
          </MessengerHeaderButton>
        )}
        <button
          type="button"
          onClick={() => openProfileDrawer(peer.id)}
          title={t('chat.viewProfile')}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-1.5 py-1 text-left outline-none hover:bg-foreground/[0.04] focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MessengerAvatar user={peer} className="size-10" dotClassName="size-3" />
          <span className="min-w-0">
            <span className="block truncate text-body font-bold leading-5">{name}</span>
            <span className="block truncate text-caption leading-4 text-muted-foreground">
              {typing ? t('chat.typing', { name }) : peer.online ? t('activeNow') : t('offline')}
            </span>
          </span>
        </button>
        {!notFriends && (
          <>
            <MessengerHeaderButton
              tone="plain"
              onClick={() => call(false)}
              aria-label={t('chat.voiceCall', { name })}
              title={t('chat.voiceCall', { name })}
            >
              <Phone fill="currentColor" strokeWidth={1.5} />
            </MessengerHeaderButton>
            <MessengerHeaderButton
              tone="plain"
              onClick={() => call(true)}
              aria-label={t('chat.videoCall', { name })}
              title={t('chat.videoCall', { name })}
              className="[&_svg]:size-6"
            >
              <Video fill="currentColor" strokeWidth={1.5} />
            </MessengerHeaderButton>
          </>
        )}
        {canClear && (
          <MessengerHeaderButton
            tone="plain"
            onClick={() => setConfirmClear(true)}
            aria-label={t('chat.clear')}
            title={t('chat.clear')}
          >
            <MessageCircleX />
          </MessengerHeaderButton>
        )}
        <MessengerHeaderButton
          tone="plain"
          onClick={closeMessenger}
          aria-label={t('close')}
          title={t('close')}
        >
          <X />
        </MessengerHeaderButton>
      </header>
      <MessengerClearDialog
        open={confirmClear}
        name={name}
        onConfirm={() => void clearChat()}
        onClose={() => setConfirmClear(false)}
      />

      {/* ---- messages ---- */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onClick={() => setSelected(null)}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-2"
        role="log"
        aria-live="polite"
        aria-label={name}
      >
        <div ref={topRef} />
        {thread.loadingOlder && (
          <div className="flex justify-center py-2">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Intro (start of the conversation): avatar, name, friendship. */}
        {(thread.loaded || notFriends) && !thread.hasMore && (
          <div className="flex flex-col items-center gap-1 px-4 pt-6 pb-8 text-center">
            <MessengerAvatar
              user={peer}
              className="mb-2 size-20 text-xl"
              dotClassName="size-4 border-[3px]"
            />
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="text-caption text-muted-foreground">
              {notFriends ? t('chat.notFriends') : t('chat.friends')}
            </p>
            <button
              type="button"
              onClick={() => openProfileDrawer(peer.id)}
              className="mt-2 inline-flex h-8 items-center rounded-full bg-foreground/[0.06] px-3.5 text-sm font-semibold hover:bg-foreground/[0.1]"
            >
              {t('chat.viewProfile')}
            </button>
          </div>
        )}

        {thread.loading && !thread.loaded && (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {loadFailed && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-body text-muted-foreground">{t('chat.loadError')}</p>
            <button
              type="button"
              onClick={() => void store().loadThread(peerId, true)}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground/[0.06] px-4 text-sm font-semibold hover:bg-foreground/[0.1]"
            >
              <RotateCw className="size-4" />
              {t('chat.retryLoad')}
            </button>
          </div>
        )}

        <ol className="flex flex-col">
          {rows.map(({ message, mine, separator: label, first, last }) => {
            const isSelected = selected === message.id;
            const actions = actionsOf(message, mine);
            return (
              <li key={message.clientKey ?? message.id} className="flex flex-col">
                {label && (
                  <div className="py-3 text-center text-[12px] font-medium text-muted-foreground">
                    {label}
                  </div>
                )}
                <div
                  className={cn(
                    'group flex items-end gap-2',
                    mine ? 'flex-row-reverse' : 'flex-row',
                    first ? 'mt-1.5' : 'mt-0.5'
                  )}
                >
                  {!mine && (
                    <span className="w-7 shrink-0">
                      {last && (
                        <MessengerAvatar
                          user={peer}
                          showOnline={false}
                          className="size-7 text-[10px]"
                        />
                      )}
                    </span>
                  )}
                  <div
                    className={cn(
                      'flex max-w-[75%] min-w-0 flex-col',
                      mine ? 'items-end' : 'items-start'
                    )}
                    title={formatFullTime(message.createdAt, i18n.language)}
                    onClick={e => {
                      e.stopPropagation();
                      setSelected(isSelected ? null : message.id);
                    }}
                  >
                    <MessengerBubble
                      message={message}
                      mine={mine}
                      first={first}
                      last={last}
                      deletedLabel={mine ? t('chat.deletedOwn') : t('chat.deleted')}
                    />
                  </div>
                  {actions.length > 0 && (
                    <div
                      className={cn(
                        'self-center transition-opacity',
                        isSelected
                          ? 'opacity-100'
                          : 'group-hover:opacity-100 focus-within:opacity-100'
                      )}
                      onClick={e => e.stopPropagation()}
                    >
                      <NotifyItemMenu
                        title={t('chat.actions')}
                        items={actions}
                        className="size-8"
                      />
                    </div>
                  )}
                </div>

                {/* Tapped bubble: exact time. */}
                <AnimatePresence initial={false}>
                  {isSelected && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={cn(
                        'overflow-hidden px-1 pt-1 text-[11px] text-muted-foreground',
                        mine ? 'text-right' : 'pl-10'
                      )}
                    >
                      {formatFullTime(message.createdAt, i18n.language)}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Status of own messages. */}
                {mine && message.status === 'failed' && (
                  <p className="flex items-center justify-end gap-2 pt-1 text-[12px] text-destructive">
                    {t('chat.failed')} ·
                    <button
                      type="button"
                      onClick={() =>
                        message.clientKey && void store().retry(peerId, message.clientKey)
                      }
                      className="font-semibold underline-offset-2 hover:underline"
                    >
                      {t('chat.retry')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        message.clientKey && store().discard(peerId, message.clientKey)
                      }
                      aria-label={t('chat.discard')}
                      title={t('chat.discard')}
                      className="grid size-5 place-items-center rounded-full hover:bg-foreground/6"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </p>
                )}
                {mine && message.id === lastReadOwnId && (
                  <div className="flex justify-end pt-1" title={t('chat.seen')}>
                    <MessengerAvatar
                      user={peer}
                      showOnline={false}
                      className="size-3.5 text-[6px]"
                    />
                    <span className="sr-only">{t('chat.seen')}</span>
                  </div>
                )}
                {mine &&
                  message === lastMessage &&
                  !message.readAt &&
                  !message.deleted &&
                  message.status !== 'failed' && (
                    <p className="pt-1 text-right text-[11px] text-muted-foreground">
                      {message.status === 'sending' ? t('chat.sending') : t('chat.sent')}
                    </p>
                  )}
              </li>
            );
          })}
        </ol>

        {typing && (
          <div className="mt-1.5 flex items-end gap-2">
            <MessengerAvatar user={peer} showOnline={false} className="size-7 text-[10px]" />
            <MessengerTypingBubble label={t('chat.typing', { name })} />
          </div>
        )}
      </div>

      {/* ---- composer ---- */}
      {notFriends ? (
        <p className="shrink-0 border-t border-border/60 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-caption text-muted-foreground">
          {t('chat.notFriends')}
        </p>
      ) : (
        <MessengerComposer key={peerId} peerId={peerId} autoFocus={!mobile} />
      )}
    </div>
  );
};
