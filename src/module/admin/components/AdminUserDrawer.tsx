import { AdminBanPanel } from '@core/security/components/AdminBanPanel.tsx';
import { AppDrawer } from '@ui/patterns';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { AdminRoleUpdate, IAdminRoleResult, IAdminUser } from '../types';
import { AdminRoleEditor } from './AdminRoleEditor';
import { AdminUserHeader } from './AdminUserHeader';

export interface IAdminUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: IAdminUser | null;
  saving: boolean;
  onUpdate: (user: IAdminUser, change: AdminRoleUpdate) => Promise<IAdminRoleResult>;
  onChanged: (user: IAdminUser) => void;
}

/** Bottom drawer: one user – roles and ban. */
export const AdminUserDrawer: React.FC<IAdminUserDrawerProps> = ({
  open,
  onOpenChange,
  user,
  saving,
  onUpdate,
  onChanged,
}) => {
  const { t } = useTranslation('admin');
  const close = (next: boolean) => {
    if (!saving) onOpenChange(next);
  };

  return (
    <AppDrawer
      open={open}
      onOpenChange={close}
      title={t('drawer.title')}
      description={t('drawer.description')}
      closeLabel={t('drawer.close')}
      locked={saving}
      bodyKey={user?.id ?? ''}
      bodyClassName="space-y-6 py-5 sm:px-6"
    >
      {user && (
        <>
          <AdminUserHeader user={user} />
          <AdminRoleEditor user={user} saving={saving} onUpdate={onUpdate} onChanged={onChanged} />
          {!user.superUser && <AdminBanPanel key={user.id} userId={user.id} disabled={saving} />}
        </>
      )}
    </AppDrawer>
  );
};
