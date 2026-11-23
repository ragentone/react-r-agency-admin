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
import { useTranslation } from 'react-i18next';

interface IProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Delete confirmation. */
export const ShopConfirmDialog = ({ open, title, description, onConfirm, onCancel }: IProps) => {
  const { t } = useTranslation('admin-shop');
  return (
    <AlertDialog open={open} onOpenChange={o => !o && onCancel()}>
      <AlertDialogContent className="border-border/50">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border/50">{t('confirm.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('confirm.delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
