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
import React from 'react';
import { useTranslation } from 'react-i18next';

/** "Really remove?" – X style: title, text, big red button, cancel below. */
export const SeoDeleteDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
  busy: boolean;
  onConfirm: () => void;
}> = ({ open, onOpenChange, path, busy, onConfirm }) => {
  const { t } = useTranslation('seo');
  return (
    <AlertDialog open={open} onOpenChange={next => !busy && onOpenChange(next)}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-6 rounded-2xl p-8">
        <AlertDialogHeader className="space-y-2 text-left">
          <AlertDialogTitle className="text-xl font-bold tracking-tight">
            {t('delete.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body leading-5">
            {t('delete.description', { path })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            variant="destructive"
            size="lg"
            fullWidth
            isLoading={busy}
            disabled={busy}
            onClick={onConfirm}
          >
            {t('delete.confirm')}
          </Button>
          <AlertDialogCancel disabled={busy} className="mt-0 h-11 w-full text-body sm:mt-0">
            {t('form.cancel')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
