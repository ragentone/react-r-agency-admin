import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';

/** Spieler vom Server werfen, optional mit Grund (der Spieler sieht ihn beim Rauswurf). */
export const KickPlayerDialog: React.FC<{
  serverId: string;
  name: string;
  onClose: () => void;
}> = ({ serverId, name, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const kick = async () => {
    setBusy(true);
    const result = await AdminMinecraftApi.kickPlayer(serverId, name, reason);
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`action.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t('kick.done', { name }));
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('kick.title', { name })}
      description={t('kick.text')}
      size="sm"
      bodyClassName="p-4"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button variant="destructive" isLoading={busy} onClick={() => void kick()}>
            {t('kick.confirm')}
          </Button>
        </>
      }
    >
      <Input
        value={reason}
        maxLength={120}
        placeholder={t('kick.reason')}
        onChange={event => setReason(event.target.value)}
      />
    </AppDialog>
  );
};
