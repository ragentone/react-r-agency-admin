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
import { buttonVariants } from '@ui/shad-cn/components/button.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type FriendConfirmKind = 'remove' | 'block' | 'cancel';

export interface IFriendConfirmDialogProps {
  kind: FriendConfirmKind | null;
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** Confirms the actions that can't simply be undone: end friendship, block, withdraw request. */
export const FriendConfirmDialog: React.FC<IFriendConfirmDialogProps> = ({
  kind,
  name,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation('friends');
  return (
    <AlertDialog open={kind !== null} onOpenChange={open => !open && onClose()}>
      <AlertDialogContent className="max-w-sm rounded-3xl">
        {kind && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-title font-extrabold">
                {t(`confirm.${kind}.title`, { name })}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-body">
                {t(`confirm.${kind}.text`, { name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:flex-col sm:space-x-0">
              <AlertDialogAction
                onClick={onConfirm}
                className={buttonVariants({
                  variant: kind === 'block' ? 'destructive' : 'default',
                  size: 'lg',
                  fullWidth: true,
                })}
              >
                {t(`confirm.${kind}.action`)}
              </AlertDialogAction>
              <AlertDialogCancel
                className={buttonVariants({
                  variant: 'outline',
                  size: 'lg',
                  fullWidth: true,
                  className: 'mt-0',
                })}
              >
                {t('actions.back')}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
