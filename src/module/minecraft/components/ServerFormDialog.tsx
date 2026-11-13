import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import { type IMinecraftGamemode, type IMinecraftServer, MINECRAFT_GAMEMODES } from '../types';

/** Dialog zum Anlegen (ohne `server`) oder Bearbeiten eines Servers; Ports vergibt das Backend. */
export const ServerFormDialog: React.FC<{
  server?: IMinecraftServer;
  onSaved: () => void;
  onClose: () => void;
}> = ({ server, onSaved, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [name, setName] = useState(server?.name ?? '');
  const [gamemode, setGamemode] = useState<IMinecraftGamemode>(server?.gamemode ?? 'survival');
  const [maxPlayers, setMaxPlayers] = useState(String(server?.maxPlayers ?? 10));
  const [autostart, setAutostart] = useState(server?.autostart ?? false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const input = {
      name: name.trim(),
      gamemode,
      maxPlayers: Number(maxPlayers) || 10,
      autostart,
    };
    const result = server
      ? await AdminMinecraftApi.update(server.id, input)
      : await AdminMinecraftApi.create(input);
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`action.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t(server ? 'form.saved' : 'form.created'));
    if ('restartRequired' in result && result.restartRequired) toast.info(t('form.restartHint'));
    onSaved();
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t(server ? 'form.editTitle' : 'form.createTitle')}
      description={t(server ? 'form.editText' : 'form.createText')}
      size="sm"
      bodyClassName="p-4"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button disabled={!name.trim() || busy} isLoading={busy} onClick={() => void submit()}>
            {t(server ? 'form.save' : 'form.create')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="mc-name">{t('form.name')}</Label>
          <Input id="mc-name" value={name} maxLength={60} onChange={e => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t('form.gamemode')}</Label>
          <Select value={gamemode} onValueChange={v => setGamemode(v as IMinecraftGamemode)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MINECRAFT_GAMEMODES.map(mode => (
                <SelectItem key={mode} value={mode}>
                  {t(`gamemode.${mode}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mc-max">{t('form.maxPlayers')}</Label>
          <Input
            id="mc-max"
            type="number"
            min={1}
            max={100}
            value={maxPlayers}
            onChange={e => setMaxPlayers(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="mc-autostart">{t('form.autostart')}</Label>
          <Switch id="mc-autostart" checked={autostart} onCheckedChange={setAutostart} />
        </div>
      </div>
    </AppDialog>
  );
};
