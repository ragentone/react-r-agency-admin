import { useAuthStore } from '@core/auth/auth.store.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ShieldCheck } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAdminUser } from '../hooks';
import type { AdminRoleUpdate, IAdminRoleResult, IAdminUser } from '../types';
import { AdminRoleEditor } from './AdminRoleEditor';
import { AdminUserHeader } from './AdminUserHeader';

export interface IAdminSelfViewProps {
  saving: boolean;
  onUpdate: (user: IAdminUser, change: AdminRoleUpdate) => Promise<IAdminRoleResult>;
}

/** Own roles – `admin:user` (+ `default:user`) are protected. */
export const AdminSelfView: React.FC<IAdminSelfViewProps> = ({ saving, onUpdate }) => {
  const { t } = useTranslation('admin');
  const selfId = useAuthStore(state => state.userMeta?.id ?? null);
  const { user, setUser, loading, error, load } = useAdminUser();

  useEffect(() => {
    if (selfId) void load(selfId);
  }, [selfId, load]);

  if (!user) {
    if (error && !loading) {
      return (
        <div role="alert" className="px-8 py-16 text-center">
          <p className="text-body text-muted-foreground">{t('error.load')}</p>
          <button
            type="button"
            onClick={() => selfId && void load(selfId)}
            className="mt-4 h-11 rounded-full bg-foreground px-5 text-sm font-bold text-background"
          >
            {t('retry')}
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-4 px-4 py-5" aria-busy="true">
        <div className="flex items-center gap-3">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2 rounded-full" />
            <Skeleton className="h-3 w-2/3 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <AdminUserHeader user={user} />
      <p className="flex items-start gap-2 rounded-2xl bg-foreground/[0.05] p-3 text-caption text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {t('self.hint')}
      </p>
      <AdminRoleEditor user={user} saving={saving} onUpdate={onUpdate} onChanged={setUser} />
    </div>
  );
};
