import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Copy } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export interface IAdminCredentials {
  alias: string;
  email: string;
  password: string;
  confirmed: boolean;
}

export interface IAdminUserCredentialsDialogProps {
  /** `null` = closed. The password only lives in memory until the dialog is closed. */
  credentials: IAdminCredentials | null;
  onClose: () => void;
}

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => {
  const { t } = useTranslation('admin');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t('users.created.copied', { label }));
    } catch {
      toast.error(t('users.created.copyFailed'));
    }
  };
  return (
    <div className="space-y-1">
      <p className="text-caption font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-border/50 p-1 pl-3">
        <span className={`min-w-0 flex-1 truncate text-body ${mono ? 'font-mono' : ''}`}>
          {value}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-md"
          onClick={() => void copy()}
          aria-label={t('users.created.copy', { label })}
        >
          <Copy className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

/** One-time dialog after creating an admin: e-mail + password to hand over. */
export const AdminUserCredentialsDialog: React.FC<IAdminUserCredentialsDialogProps> = ({
  credentials,
  onClose,
}) => {
  const { t } = useTranslation('admin');
  return (
    <AlertDialog open={Boolean(credentials)} onOpenChange={next => !next && onClose()}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[380px] gap-5 rounded-2xl p-6">
        {credentials && (
          <>
            <AlertDialogHeader className="space-y-2 text-left">
              <AlertDialogTitle className="text-xl font-bold tracking-tight">
                {t('users.created.title', { alias: credentials.alias })}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-body leading-5">
                {t('users.created.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <Row label={t('users.create.email')} value={credentials.email} />
              <Row label={t('users.create.password')} value={credentials.password} mono />
            </div>
            <p className="text-caption text-muted-foreground">
              {credentials.confirmed ? t('users.created.confirmed') : t('users.created.mailSent')}
            </p>
            <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
              <Button type="button" size="lg" fullWidth onClick={onClose}>
                {t('users.created.done')}
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
