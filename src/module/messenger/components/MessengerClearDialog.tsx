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

export interface IMessengerClearDialogProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** "Delete chat?" – deletes all messages for both users (can't be undone). */
export const MessengerClearDialog: React.FC<IMessengerClearDialogProps> = ({
  open,
  name,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation('messenger');
  return (
    <AlertDialog open={open} onOpenChange={next => !next && onClose()}>
      <AlertDialogContent className="max-w-sm rounded-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{t('chat.clearTitle', { name })}</AlertDialogTitle>
          <AlertDialogDescription>{t('chat.clearText', { name })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:flex-col sm:space-x-0">
          <AlertDialogAction
            onClick={onConfirm}
            className="h-11 w-full rounded-full bg-destructive font-bold text-white hover:bg-destructive/90"
          >
            {t('chat.clearConfirm')}
          </AlertDialogAction>
          <AlertDialogCancel className="mt-0 h-11 w-full rounded-full font-bold">
            {t('chat.cancel')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
