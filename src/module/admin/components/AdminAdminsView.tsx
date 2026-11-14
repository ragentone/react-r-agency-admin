import { useLoadMoreSentinel } from '@core/notify/hooks/use.load.more.sentinel.ts';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAdminAdmins } from '../hooks';
import type { AdminRoleUpdate, IAdminRoleResult, IAdminUser } from '../types';
import { AdminUserCreateButton } from './AdminUserCreateButton';
import { AdminUserDrawer } from './AdminUserDrawer';
import { AdminUserItem } from './AdminUserItem';
import { AdminUsersTable } from './AdminUsersTable';

export interface IAdminAdminsViewProps {
  saving: boolean;
  onUpdate: (user: IAdminUser, change: AdminRoleUpdate) => Promise<IAdminRoleResult>;
}

/** Super administrator: every admin account, infinite scroll → tap → role drawer. */
export const AdminAdminsView: React.FC<IAdminAdminsViewProps> = ({ saving, onUpdate }) => {
  const { t } = useTranslation('admin');
  const { users, total, loading, loaded, error, hasMore, reload, loadMore, replace, remove } =
    useAdminAdmins();
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Snapshot keeps the drawer content while it closes.
  const [snapshot, setSnapshot] = useState<IAdminUser | null>(null);
  const opened = useMemo(
    () => users.find(user => user.id === openedId) ?? snapshot,
    [users, openedId, snapshot]
  );
  const sentinel = useLoadMoreSentinel(loaded && hasMore && !loading, loadMore);

  useEffect(() => {
    void reload();
  }, [reload]);

  const open = (user: IAdminUser) => {
    setOpenedId(user.id);
    setSnapshot(user);
    setDrawerOpen(true);
  };
  const changed = (user: IAdminUser) => {
    replace(user);
    setSnapshot(user);
  };

  const deleted = (user: IAdminUser) => {
    setDrawerOpen(false);
    remove(user.id);
  };

  let body: React.ReactNode;
  if (!loaded) {
    body = (
      <div className="space-y-5 px-4 py-4" aria-busy="true">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-1/2 rounded-full" />
              <Skeleton className="h-3 w-2/3 rounded-full" />
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
          onClick={() => void reload()}
          className="mt-4 h-10 rounded-lg bg-foreground px-4 text-sm font-semibold text-background"
        >
          {t('retry')}
        </button>
      </div>
    );
  } else {
    body = (
      <>
        <ul className="divide-y divide-border/50 md:hidden" aria-busy={loading}>
          {users.map(user => (
            <AdminUserItem key={user.id} user={user} onOpen={open} />
          ))}
        </ul>
        <AdminUsersTable users={users} onOpen={open} />
        <div
          ref={sentinel}
          className="flex h-12 items-center justify-center"
          aria-hidden={!loading}
        >
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
        {error && (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="mx-auto mb-4 block h-10 rounded-lg border border-border/50 px-4 text-sm font-semibold hover:bg-muted"
          >
            {t('retry')}
          </button>
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-border/50 p-3">
        <p className="flex min-w-0 items-center gap-2 text-caption text-muted-foreground tabular-nums">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          <span aria-live="polite">{loaded ? t('admins.count', { count: total }) : '…'}</span>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            aria-label={t('admins.reload')}
            title={t('admins.reload')}
            className="inline-flex size-10 items-center justify-center rounded-lg border border-border/50 transition-colors hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} aria-hidden="true" />
          </button>
          <AdminUserCreateButton onCreated={() => void reload()} />
        </div>
      </div>
      {body}
      <AdminUserDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        user={opened}
        saving={saving}
        onUpdate={onUpdate}
        onChanged={changed}
        onDeleted={deleted}
      />
    </>
  );
};
