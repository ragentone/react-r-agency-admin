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
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Check, Fingerprint, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { useOnOpen } from '../hooks/use.on.open';
import { withSudo } from '../sudo';
import type { IAuthPasskey } from '../types';
import { relativeTime } from '../utils/format';
import { passkeySupported } from '../utils/webauthn';
import { addPasskey } from './passkey.actions';
import { BigButton, InfoBox, SecurityDrawer } from './ui';

export const PasskeysDrawer: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}> = ({ open, onOpenChange, onChanged }) => {
  const { t, i18n } = useTranslation('security');
  const errorText = useErrorText();
  const [passkeys, setPasskeys] = useState<IAuthPasskey[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [removing, setRemoving] = useState<IAuthPasskey | null>(null);
  const supported = passkeySupported();

  useOnOpen(open, () => {
    setPasskeys(null);
    setEditing(null);
  });

  useEffect(() => {
    if (!open) return;
    let active = true;
    void AuthApi.security().then(result => {
      if (active) setPasskeys(result.security?.passkeys ?? []);
    });
    return () => {
      active = false;
    };
  }, [open]);

  const add = async () => {
    setBusy('add');
    const list = await addPasskey(errorText as never, t);
    setBusy(null);
    if (list) {
      setPasskeys(list);
      onChanged?.();
    }
  };

  const rename = async (passkey: IAuthPasskey) => {
    const clean = name.trim();
    if (!clean || clean === passkey.name) {
      setEditing(null);
      return;
    }
    setBusy(passkey.id);
    const result = await AuthApi.passkeyRename(passkey.id, clean);
    setBusy(null);
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setPasskeys(result.passkeys ?? []);
    setEditing(null);
  };

  const remove = async () => {
    const passkey = removing;
    setRemoving(null);
    if (!passkey) return;
    setBusy(passkey.id);
    const result = await withSudo(() => AuthApi.passkeyRemove(passkey.id));
    setBusy(null);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setPasskeys(result.passkeys ?? []);
    onChanged?.();
    toast.success(t('passkeys.removed'));
  };

  return (
    <SecurityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('passkeys.title')}
      description={t('passkeys.description')}
      footer={
        supported ? (
          <BigButton onClick={add} isLoading={busy === 'add'} disabled={Boolean(busy)}>
            <Plus />
            {t('passkeys.add')}
          </BigButton>
        ) : undefined
      }
    >
      <InfoBox icon={Fingerprint} className="m-4">
        {t('passkeys.text')}
      </InfoBox>
      {!supported && <InfoBox className="mx-4 mb-4">{t('passkeys.unsupported')}</InfoBox>}

      {!passkeys && (
        <div className="flex flex-col gap-3 px-4">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      )}

      {passkeys && passkeys.length === 0 && (
        <p className="px-4 py-2 text-body leading-5 text-muted-foreground">{t('passkeys.empty')}</p>
      )}

      {passkeys && passkeys.length > 0 && (
        <ul className="flex flex-col border-t border-border/50">
          {passkeys.map(passkey => (
            <li
              key={passkey.id}
              className="flex items-center gap-3 border-b border-border/50 px-4 py-3"
            >
              <Fingerprint aria-hidden="true" className="size-5 shrink-0" strokeWidth={1.75} />
              <div className="min-w-0 flex-1">
                {editing === passkey.id ? (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={event => {
                      event.preventDefault();
                      void rename(passkey);
                    }}
                  >
                    <Input
                      value={name}
                      onChange={event => setName(event.target.value)}
                      maxLength={60}
                      aria-label={t('passkeys.name')}
                      className="h-10 rounded-full text-[16px]"
                    />
                    <Button
                      type="submit"
                      size="icon-xl"
                      pill
                      isLoading={busy === passkey.id}
                      aria-label={t('common.save')}
                      title={t('common.save')}
                    >
                      <Check />
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-body leading-5 font-bold break-words">
                        {passkey.name}
                      </span>
                      {passkey.backedUp && (
                        <Badge variant="outline" className="rounded-full">
                          {t('passkeys.synced')}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-caption leading-4 text-muted-foreground">
                      {passkey.lastUsedAt
                        ? t('passkeys.used', {
                            time: relativeTime(passkey.lastUsedAt, i18n.language),
                          })
                        : t('passkeys.neverUsed')}
                    </p>
                  </>
                )}
              </div>
              {editing !== passkey.id && (
                <div className="flex shrink-0 items-center">
                  <Button
                    variant="ghost"
                    size="icon-xl"
                    pill
                    onClick={() => {
                      setEditing(passkey.id);
                      setName(passkey.name);
                    }}
                    disabled={Boolean(busy)}
                    aria-label={t('passkeys.rename', { name: passkey.name })}
                    title={t('passkeys.rename', { name: passkey.name })}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xl"
                    pill
                    onClick={() => setRemoving(passkey)}
                    isLoading={busy === passkey.id}
                    disabled={Boolean(busy)}
                    aria-label={t('passkeys.remove', { name: passkey.name })}
                    title={t('passkeys.remove', { name: passkey.name })}
                  >
                    <Trash2 />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={Boolean(removing)} onOpenChange={value => !value && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('passkeys.removeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('passkeys.removeText', { name: removing?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>{t('passkeys.removeAction')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SecurityDrawer>
  );
};
