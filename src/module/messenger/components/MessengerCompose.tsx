import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { useIsMobile } from '@ui/shad-cn/hooks/use-mobile.ts';
import { ChevronLeft, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { matchesAlias, useMessengerFriends } from '../hooks';
import { useMessengerStore } from '../store.ts';
import { MessengerAvatar } from './MessengerAvatar.tsx';
import { MessengerHeaderButton } from './MessengerHeaderButton.tsx';

/** "New message": pick a friend (search) → opens the chat. */
export const MessengerCompose: React.FC = () => {
  const { t } = useTranslation('messenger');
  const mobile = useIsMobile();
  const setComposing = useMessengerStore(state => state.setComposing);
  const selectPeer = useMessengerStore(state => state.selectPeer);
  const closeMessenger = useMessengerStore(state => state.closeMessenger);
  const { friends, failed } = useMessengerFriends();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () =>
      [...(friends ?? [])]
        .filter(f => matchesAlias(f.alias, query))
        .sort((a, b) => Number(!!b.online) - Number(!!a.online) || a.alias.localeCompare(b.alias)),
    [friends, query]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-2 px-2 pt-3 pb-2">
        {mobile ? (
          <MessengerHeaderButton
            tone="plain"
            onClick={() => setComposing(false)}
            aria-label={t('back')}
            title={t('back')}
            className="[&_svg]:size-7"
          >
            <ChevronLeft />
          </MessengerHeaderButton>
        ) : (
          <span className="w-2" />
        )}
        <h2 className="min-w-0 flex-1 truncate text-xl font-extrabold tracking-tight">
          {t('compose.title')}
        </h2>
        <MessengerHeaderButton
          onClick={() => (mobile ? closeMessenger() : setComposing(false))}
          aria-label={t('close')}
          title={t('close')}
        >
          <X />
        </MessengerHeaderButton>
      </header>

      <label className="mx-4 mb-2 flex h-10 shrink-0 items-center gap-2 border-b border-border/60 text-body">
        <span className="font-semibold text-muted-foreground">{t('compose.to')}</span>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('compose.search')}
          aria-label={t('compose.search')}
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-body [&::-webkit-search-cancel-button]:hidden"
        />
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {failed ? (
          <p className="px-4 py-10 text-center text-body text-muted-foreground">
            {t('compose.loadError')}
          </p>
        ) : friends === null ? (
          <div className="flex flex-col gap-1 px-2" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="size-11 rounded-full" />
                <Skeleton className="h-3.5 w-2/5 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-body text-muted-foreground">
            {query ? t('compose.noResults') : t('compose.empty')}
          </p>
        ) : (
          <>
            <h3 className="px-2 pt-1 pb-1 text-caption font-semibold text-muted-foreground">
              {t('compose.suggested')}
            </h3>
            <ul>
              {filtered.map(friend => (
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
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left outline-none transition-colors hover:bg-foreground/4 focus-visible:ring-2 focus-visible:ring-ring active:bg-foreground/6"
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
                    <span className="min-w-0 flex-1 truncate text-body font-medium">
                      {friend.alias}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
