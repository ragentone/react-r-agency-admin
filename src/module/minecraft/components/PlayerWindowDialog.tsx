import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftPlayer } from '../types';
import { fromTime, toTime } from '../window-time';

/** Spielzeit eines Gamertags (deutsche Zeit): außerhalb wird er gekickt und kommt nicht rein. */
export const PlayerWindowDialog: React.FC<{
  player: IMinecraftPlayer;
  onChanged: () => void;
  onClose: () => void;
}> = ({ player, onChanged, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [from, setFrom] = useState(toTime(player.windowFrom, '15:00'));
  const [to, setTo] = useState(toTime(player.windowTo, '18:00'));
  const [busy, setBusy] = useState(false);
  const active = player.windowFrom !== null && player.windowTo !== null;

  const save = async (clear: boolean) => {
    if (!player.id) return;
    setBusy(true);
    const result = await AdminMinecraftApi.setPassWindow(
      player.id,
      clear ? null : { from: fromTime(from), to: fromTime(to) }
    );
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`window.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t(clear ? 'window.cleared' : 'window.saved'));
    onChanged();
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('window.title', { name: player.gamertag })}
      description={t('window.text')}
      size="sm"
      bodyClassName="flex flex-col gap-3 p-4"
      footer={
        <>
          {active && (
            <Button variant="outline" disabled={busy} onClick={() => void save(true)}>
              {t('window.clear')}
            </Button>
          )}
          <Button isLoading={busy} disabled={from === to} onClick={() => void save(false)}>
            {t('window.save')}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-caption text-muted-foreground">
          {t('window.from')}
          <Input
            type="time"
            step={300}
            value={from}
            onChange={event => setFrom(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-caption text-muted-foreground">
          {t('window.to')}
          <Input type="time" step={300} value={to} onChange={event => setTo(event.target.value)} />
        </label>
      </div>
      <p className="text-caption text-muted-foreground">{t('window.hint')}</p>
    </AppDialog>
  );
};
