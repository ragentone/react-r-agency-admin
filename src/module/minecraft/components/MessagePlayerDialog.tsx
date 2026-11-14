import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';

/** Nachricht nur an einen Spieler: als privater Chat oder als Titel (auf der PS5 besser lesbar). */
export const MessagePlayerDialog: React.FC<{
  serverId: string;
  serverName: string;
  name: string;
  onClose: () => void;
}> = ({ serverId, serverName, name, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [message, setMessage] = useState('');
  const [asTitle, setAsTitle] = useState(true);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    const result = await AdminMinecraftApi.messagePlayer(
      serverId,
      name,
      message,
      asTitle ? 'title' : 'chat'
    );
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`action.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t('playerMessage.done', { name }));
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('playerMessage.title', { name })}
      description={t('playerMessage.text', { server: serverName })}
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
        <Label htmlFor="mc-player-message-title">{t('broadcast.asTitle')}</Label>
        <Switch id="mc-player-message-title" checked={asTitle} onCheckedChange={setAsTitle} />
      </div>
    </AppDialog>
  );
};
