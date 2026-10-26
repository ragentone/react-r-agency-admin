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
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Fingerprint } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { dismissPasskeyPrompt, useSecurityStore } from '../store';
import { formatDate } from '../utils/format';
import { addPasskey } from './passkey.actions';
import { SudoHost } from './SudoHost';
import { BigButton, SecurityDrawer } from './ui';

/** After signing in to an account that is scheduled for deletion: cancel it? */
const DeletionPendingHost: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const { t, i18n } = useTranslation('security');
  const errorText = useErrorText();
  const pending = useSecurityStore(state => state.deletionPending);
  const setPending = useSecurityStore(state => state.setDeletionPending);
  const [busy, setBusy] = useState(false);

  const cancelDeletion = async () => {
    setBusy(true);
    const result = await AuthApi.deleteCancel();
    setBusy(false);
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setPending(null);
    toast.success(t('delete.cancelled'));
  };

  return (
    <AlertDialog open={Boolean(pending)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete.pendingTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete.pendingText', { date: pending ? formatDate(pending, i18n.language) : '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setPending(null);
              onSignOut();
            }}
            disabled={busy}
          >
            {t('delete.pendingSignOut')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={event => {
              event.preventDefault();
              void cancelDeletion();
            }}
            disabled={busy}
          >
            {t('delete.pendingCancel')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/** After a sign-in without passkey: "sign in faster next time?" (once, can be dismissed). */
const PasskeyPromptHost: React.FC = () => {
  const { t } = useTranslation('security');
  const errorText = useErrorText();
  const offer = useSecurityStore(state => state.offerPasskey);
  const pending = useSecurityStore(state => state.deletionPending);
  const setOffer = useSecurityStore(state => state.setOfferPasskey);
  const [busy, setBusy] = useState(false);

  const later = () => {
    dismissPasskeyPrompt();
    setOffer(false);
  };

  const create = async () => {
    setBusy(true);
    const list = await addPasskey(errorText as never, t);
    setBusy(false);
    if (list) {
      dismissPasskeyPrompt();
      setOffer(false);
    }
  };

  return (
    <SecurityDrawer
      open={offer && !pending}
      onOpenChange={open => !open && later()}
      title={t('prompt.title')}
      description={t('prompt.text')}
      locked={busy}
      compact
    >
      <div className="flex flex-col items-center gap-4 px-4 pt-6 pb-[max(env(safe-area-inset-bottom),1.25rem)] text-center">
        <span className="grid size-16 place-items-center rounded-full border border-border/60">
          <Fingerprint aria-hidden="true" className="size-8" strokeWidth={1.5} />
        </span>
        <p className="text-body leading-5 text-muted-foreground">{t('prompt.text')}</p>
        <BigButton onClick={create} isLoading={busy} disabled={busy}>
          {t('prompt.create')}
        </BigButton>
        <Button
          variant="ghost"
          pill
          className="h-11 w-full font-bold"
          onClick={later}
          disabled={busy}
        >
          {t('prompt.later')}
        </Button>
      </div>
    </SecurityDrawer>
  );
};

/** Mounted by the AuthProvider – dialogs that follow a sign-in. */
export const SecurityLoginHosts: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => (
  <>
    <DeletionPendingHost onSignOut={onSignOut} />
    <PasskeyPromptHost />
    <SudoHost />
  </>
);
