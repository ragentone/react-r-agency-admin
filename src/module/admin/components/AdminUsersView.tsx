import { Input } from '@ui/shad-cn/components/input.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { useDebounce } from '@uidotdev/usehooks';
import { Loader2, Search, UserSearch, UsersRound } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_SEARCH_DEBOUNCE, ADMIN_SEARCH_MIN } from '../const';
import { useAdminUsers } from '../hooks';
import type { AdminRoleUpdate, IAdminRoleResult, IAdminUser } from '../types';
import { AdminUserDrawer } from './AdminUserDrawer';
import { AdminUserItem } from './AdminUserItem';

export interface IAdminUsersViewProps {
  saving: boolean;
  onUpdate: (user: IAdminUser, change: AdminRoleUpdate) => Promise<IAdminRoleResult>;
}

/** Search users (alias / e-mail / id) → tap → role drawer. Nothing is loaded before a search. */
export const AdminUsersView: React.FC<IAdminUsersViewProps> = ({ saving, onUpdate }) => {
  const { t } = useTranslation('admin');
  const { users, total, loading, loaded, error, hasMore, search, loadMore, replace } =
    useAdminUsers();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, ADMIN_SEARCH_DEBOUNCE);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Snapshot keeps the drawer content while it closes.
  const [snapshot, setSnapshot] = useState<IAdminUser | null>(null);
  const opened = useMemo(
    () => users.find(user => user.id === openedId) ?? snapshot,
    [users, openedId, snapshot]
  );

  useEffect(() => {
    void search(debounced);
  }, [debounced, search]);

  const open = (user: IAdminUser) => {
    setOpenedId(user.id);
    setSnapshot(user);
    setDrawerOpen(true);
  };

  const changed = (user: IAdminUser) => {
    replace(user);
    setSnapshot(user);
  };

  const searching = debounced.trim().length >= ADMIN_SEARCH_MIN;

  let body: React.ReactNode;
  if (!searching) {
    body = (
      <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
          <UserSearch className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-title font-bold">{t('users.idleTitle')}</h2>
        <p className="mt-1 text-body text-muted-foreground">
          {t('users.idle', { count: ADMIN_SEARCH_MIN })}
        </p>
      </div>
    );
  } else if (loading && !loaded) {
    body = (
      <div className="space-y-5 px-4 py-4" aria-busy="true">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-1/2 rounded-full" />
              <Skeleton className="h-3 w-2/3 rounded-full" />
              <Skeleton className="h-5 w-1/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (error && users.length === 0) {
    body = (
      <div role="alert" className="px-8 py-16 text-center">
        <p className="text-body text-muted-foreground">{t('error.load')}</p>
        <button
          type="button"
          onClick={() => void search(debounced)}
          className="mt-4 h-11 rounded-full bg-foreground px-5 text-sm font-bold text-background"
        >
          {t('retry')}
        </button>
      </div>
    );
  } else if (users.length === 0) {
    body = (
      <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
          <UsersRound className="size-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-body text-muted-foreground">
          {t('users.noResults', { term: debounced.trim() })}
        </p>
      </div>
    );
  } else {
    body = (
      <>
        <ul className="divide-y divide-border/50" aria-busy={loading}>
          {users.map(user => (
            <AdminUserItem key={user.id} user={user} onOpen={open} />
          ))}
        </ul>
        {hasMore && (
          <div className="px-4 py-4">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border/70 text-sm font-bold transition-colors hover:bg-foreground/[0.04] disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {t('users.more', { count: total - users.length })}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-10 space-y-1 bg-background/85 px-3 pt-3 pb-2 backdrop-blur-md">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('users.searchPlaceholder')}
            aria-label={t('users.searchPlaceholder')}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="h-11 rounded-full pr-10 pl-10 text-base sm:text-body"
          />
          {loading && loaded && (
            <Loader2
              className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
        {searching && loaded && (
          <p className="px-2 text-caption text-muted-foreground tabular-nums" aria-live="polite">
            {t('users.found', { count: total })}
          </p>
        )}
      </div>

      {body}

      <AdminUserDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        user={opened}
        saving={saving}
        onUpdate={onUpdate}
        onChanged={changed}
      />
    </>
  );
};
