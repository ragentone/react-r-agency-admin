import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';

/** Nachricht an alle Spieler: als Chat oder als Titel (auf der PS5 besser lesbar). */
export const BroadcastDialog: React.FC<{
  serverId: string;
  name: string;
  onClose: () => void;
}> = ({ serverId, name, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [message, setMessage] = useState('');
  const [asTitle, setAsTitle] = useState(true);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    const result = await AdminMinecraftApi.broadcast(serverId, message, asTitle ? 'title' : 'chat');
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`action.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t('broadcast.done'));
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('broadcast.title', { name })}
      description={t('broadcast.text')}
      size="sm"
      bodyClassName="flex flex-col gap-4 p-4"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button isLoading={busy} disabled={!message.trim()} onClick={() => void send()}>
            {t('broadcast.send')}
          </Button>
        </>
      }
    >
      <Input
        value={message}
        maxLength={120}
        placeholder={t('broadcast.placeholder')}
        onChange={event => setMessage(event.target.value)}
      />
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="mc-broadcast-title">{t('broadcast.asTitle')}</Label>
        <Switch id="mc-broadcast-title" checked={asTitle} onCheckedChange={setAsTitle} />
      </div>
    </AppDialog>
  );
};
