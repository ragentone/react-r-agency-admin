import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Copy, RefreshCw, Share2, UserPlus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { useOnOpen } from '../hooks/use.on.open';
import type { IAuthInviteResult } from '../types';
import { formatDate, inviteUrl } from '../utils/format';
import { BigButton, InfoBox, SecurityDrawer } from './ui';

/** Personal invite link – who signs up with it is your friend right away. */
export const InviteDrawer: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const { t, i18n } = useTranslation('security');
  const errorText = useErrorText();
  const [invite, setInvite] = useState<IAuthInviteResult | null>(null);
  const [busy, setBusy] = useState(false);

  useOnOpen(open, () => setInvite(null));

  useEffect(() => {
    if (!open) return;
    void AuthApi.invite().then(result => {
      if (!result.success) toast.error(errorText(result));
      setInvite(result);
    });
  }, [open, errorText]);

  const url = invite?.token ? inviteUrl(invite.token) : '';
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const share = async () => {
    try {
      await navigator.share({ title: t('invite.shareTitle'), text: t('invite.shareText'), url });
    } catch {
      // Closed by the user.
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('errors.unknown'));
    }
  };

  const renew = async () => {
    setBusy(true);
    const result = await AuthApi.inviteRenew();
    setBusy(false);
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    setInvite(result);
    toast.success(t('invite.renewed'));
  };

  return (
    <SecurityDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('invite.title')}
      description={t('invite.description')}
      compact
    >
      <div className="flex flex-col gap-4 px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <InfoBox icon={UserPlus}>{t('invite.text')}</InfoBox>
        {!invite?.token ? (
          <Skeleton className="h-12 w-full rounded-2xl" />
        ) : (
          <>
            <button
              type="button"
              onClick={copy}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3 text-left text-body break-all active:bg-foreground/[0.06]"
              aria-label={t('common.copy')}
            >
              <span className="select-all">{url}</span>
              <Copy aria-hidden="true" className="size-4 shrink-0" />
            </button>
            <p className="text-caption leading-4 text-muted-foreground">
              {t('invite.meta', {
                count: invite.uses ?? 0,
                date: invite.expiresAt ? formatDate(invite.expiresAt, i18n.language) : '',
              })}
            </p>
            {canShare ? (
              <BigButton onClick={share}>
                <Share2 />
                {t('invite.share')}
              </BigButton>
            ) : (
              <BigButton onClick={copy}>
                <Copy />
                {t('common.copy')}
              </BigButton>
            )}
            <Button
              variant="ghost"
              pill
              className="h-11 font-bold"
              onClick={renew}
              isLoading={busy}
            >
              <RefreshCw />
              {t('invite.renew')}
            </Button>
          </>
        )}
      </div>
    </SecurityDrawer>
  );
};
