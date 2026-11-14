import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAdminAdminDelete } from '../hooks';
import type { IAdminUser } from '../types';

export interface IAdminUserDeletePanelProps {
  user: IAdminUser;
  onDeleted: (user: IAdminUser) => void;
}

/** Delete an admin account (confirm dialog). The admin is signed out everywhere at once. */
export const AdminUserDeletePanel: React.FC<IAdminUserDeletePanelProps> = ({ user, onDeleted }) => {
  const { t } = useTranslation('admin');
  const { deleting, remove } = useAdminAdminDelete();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    const failed = await remove(user.id);
    if (failed) {
      setError(failed);
      return;
    }
    setOpen(false);
    toast.success(t('admins.delete.toast', { alias: user.alias }));
    onDeleted(user);
  };

  return (
    <section className="space-y-3 border-t border-border/50 px-4 pt-5 sm:px-0">
      <p className="text-caption text-muted-foreground">{t('admins.delete.hint')}</p>
      <Button
        type="button"
        variant="destructive"
        size="lg"
        fullWidth
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {t('admins.delete.action')}
      </Button>
      <AlertDialog open={open} onOpenChange={next => !deleting && setOpen(next)}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-6 rounded-2xl p-8">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-title font-bold">
              {t('admins.delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body leading-5">
              {t('admins.delete.description', { alias: user.alias })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-caption text-destructive" role="alert">
              {t(error)}
            </p>
          )}
          <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
            <Button
              type="button"
              variant="destructive"
              size="lg"
              fullWidth
              disabled={deleting}
              isLoading={deleting}
              onClick={() => void confirm()}
            >
              {t('admins.delete.confirm')}
            </Button>
            <AlertDialogCancel disabled={deleting} className="mt-0 h-11 w-full text-body sm:mt-0">
              {t('admins.delete.cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
