import { authButtonPrimary, authButtonSecondary } from '@core/auth/components/auth.styles.ts';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from './use.auth.ts';

interface IProps {
  active: boolean;
  onConfirm(): void;
  onAbort(): void;
}

/** X-style confirm: logo, title, account row, stacked full-width buttons. */
const AuthLogoutConfirmDialog: React.FC<IProps> = ({ active, onConfirm, onAbort }) => {
  const { t } = useTranslation('auth');
  const { isLoggingOut, userMeta } = useAuth();

  const userDisplayName = userMeta?.alias || userMeta?.email || '';
  const initials = (userMeta?.alias || userMeta?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <AlertDialog
      open={active}
      onOpenChange={open => {
        if (!open) {
          onAbort();
        }
      }}
    >
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-6 rounded-2xl p-8">
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="mx-auto size-10 select-none dark:invert"
          draggable={false}
        />

        <AlertDialogHeader className="space-y-2 text-left">
          <AlertDialogTitle className="text-xl font-bold tracking-tight">
            {t('logout.title', { defaultValue: 'Log Out' })}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body leading-5">
            {t('logout.description', {
              defaultValue: 'Are you sure you want to log out?',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {userMeta && (
          <div className="-mx-2 flex items-center gap-3 rounded-xl border border-border/50 p-3">
            <Avatar className="size-10 shrink-0">
              {userMeta.avatarUrl && <AvatarImage src={userMeta.avatarUrl} alt={userDisplayName} />}
              <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 text-body leading-5">
              <div className="truncate font-bold text-foreground">{userMeta.alias}</div>
              <div className="truncate text-muted-foreground">{userMeta.email}</div>
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className={authButtonPrimary}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('logout.loggingOut', { defaultValue: 'Logging out...' })}
              </>
            ) : (
              t('logout.confirm', { defaultValue: 'Log Out' })
            )}
          </button>
          <button
            type="button"
            onClick={onAbort}
            disabled={isLoggingOut}
            className={authButtonSecondary}
          >
            {t('logout.cancel', { defaultValue: 'Cancel' })}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { AuthLogoutConfirmDialog };
