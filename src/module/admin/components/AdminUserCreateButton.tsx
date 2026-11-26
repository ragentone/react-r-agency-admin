import { useRoles } from '@core/auth/roles/use.roles.ts';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type IAdminUserCreateValues, useAdminUserCreate } from '../hooks';
import { AdminUserCreateDrawer } from './AdminUserCreateDrawer';
import { AdminUserCredentialsDialog, type IAdminCredentials } from './AdminUserCredentialsDialog';

export interface IAdminUserCreateButtonProps {
  /** The account was created – e.g. search for it. */
  onCreated: (alias: string) => void;
}

/** "New admin" button + form drawer. */
export const AdminUserCreateButton: React.FC<IAdminUserCreateButtonProps> = ({ onCreated }) => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<IAdminCredentials | null>(null);
  const { saving, create } = useAdminUserCreate();
  const { can } = useRoles();

  const submit = async (values: IAdminUserCreateValues): Promise<string | null> => {
    const result = await create(values);
    if (!result.ok) return result.error ?? 'error.create';
    // One time only: the password is not shown anywhere else afterwards.
    setCreated({ ...values });
    onCreated(values.alias);
    return null;
  };

  // Only the super administrator may create admins (the backend checks it too).
  if (!can('super:admin:user')) return null;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        aria-label={t('users.create.open')}
        className="h-10 px-3 sm:px-4"
      >
        <UserPlus className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('users.create.open')}</span>
      </Button>
      <AdminUserCreateDrawer open={open} onOpenChange={setOpen} saving={saving} onSubmit={submit} />
      <AdminUserCredentialsDialog credentials={created} onClose={() => setCreated(null)} />
    </>
  );
};
