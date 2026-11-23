import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IShopRequest } from '../types/request';

export interface IShopRequestDeleteDialogProps {
  /** Request to delete, `null` keeps the dialog closed. */
  request: IShopRequest | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}

/** "Delete this request?" – deleting is permanent, so ask first. */
export const ShopRequestDeleteDialog: React.FC<IShopRequestDeleteDialogProps> = ({
  request,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation('admin-shop');

  return (
    <AlertDialog open={request !== null} onOpenChange={open => !open && onCancel()}>
      <AlertDialogContent className="border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('crm.deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('crm.deleteDescription', { title: request?.itemTitle })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border/50">
            {t('crm.deleteCancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => request && onConfirm(request.id)}>
            {t('crm.deleteConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
