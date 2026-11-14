import { useRoles } from '@core/auth/roles/use.roles.ts';
import { UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { type IAdminUserCreateValues, useAdminUserCreate } from '../hooks';
import { AdminUserCreateDrawer } from './AdminUserCreateDrawer';

export interface IAdminUserCreateButtonProps {
  /** The account was created – e.g. search for it. */
  onCreated: (alias: string) => void;
}

/** "New admin" button + form drawer. */
export const AdminUserCreateButton: React.FC<IAdminUserCreateButtonProps> = ({ onCreated }) => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const { saving, create } = useAdminUserCreate();
  const { can } = useRoles();

  const submit = async (values: IAdminUserCreateValues): Promise<string | null> => {
    const result = await create(values);
    if (!result.ok) return result.error ?? 'error.create';
    toast.success(t('users.create.toast', { alias: values.alias }));
    onCreated(values.alias);
    return null;
  };

  // Only the super administrator may create admins (the backend checks it too).
  if (!can('super:admin:user')) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('users.create.open')}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-3 text-sm font-semibold text-background transition-opacity hover:opacity-90 sm:px-4"
      >
        <UserPlus className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('users.create.open')}</span>
      </button>
      <AdminUserCreateDrawer open={open} onOpenChange={setOpen} saving={saving} onSubmit={submit} />
    </>
  );
};
