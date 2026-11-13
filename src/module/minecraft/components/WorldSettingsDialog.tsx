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
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useWorldSettings } from '../hooks/use-world-settings';
import { MINECRAFT_DIFFICULTIES, MINECRAFT_PERMISSIONS } from '../types';

const inRange = (value: string, min: number, max: number) =>
  /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;

/** Welt-Einstellungen eines Servers: Schwierigkeit, Sicht-/Tick-Distanz, Rechte, Cheats. */
export const WorldSettingsDialog: React.FC<{
  serverId: string;
  name: string;
  onClose: () => void;
}> = ({ serverId, name, onClose }) => {
  const { t } = useTranslation('minecraft');
  const w = useWorldSettings(serverId, onClose);
  const draft = w.draft;
  const valid = !!draft && inRange(w.view, 5, 32) && inRange(w.tick, 4, 12);

  return (
    <AppDialog
      open
      onOpenChange={open => !open && !w.busy && onClose()}
      title={t('world.title', { name })}
      description={t('world.text')}
      size="sm"
      bodyClassName="flex flex-col gap-4 p-4"
      footer={
        <>
          <Button variant="outline" disabled={w.busy} onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button isLoading={w.busy} disabled={!valid} onClick={() => void w.save()}>
            {t('form.save')}
          </Button>
        </>
      }
    >
      {w.loading && <Skeleton className="h-40 w-full" aria-label={t('world.loading')} />}
      {w.error && (
        <p role="alert" className="text-caption text-destructive">
          {t(`action.error.${w.error}`, { defaultValue: t('action.error.unknown') })}
        </p>
      )}
      {draft && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mc-world-difficulty">{t('world.difficulty')}</Label>
            <Select
              value={draft.difficulty}
              onValueChange={v => w.patch({ difficulty: v as never })}
            >
              <SelectTrigger id="mc-world-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MINECRAFT_DIFFICULTIES.map(d => (
                  <SelectItem key={d} value={d}>
                    {t(`world.difficultyOption.${d}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mc-world-permission">{t('world.permission')}</Label>
            <Select
              value={draft.permission}
              onValueChange={v => w.patch({ permission: v as never })}
            >
              <SelectTrigger id="mc-world-permission">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MINECRAFT_PERMISSIONS.map(p => (
                  <SelectItem key={p} value={p}>
                    {t(`world.permissionOption.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mc-world-view">{t('world.view')}</Label>
            <Input
              id="mc-world-view"
              inputMode="numeric"
              value={w.view}
              aria-invalid={!inRange(w.view, 5, 32)}
              onChange={e => w.setView(e.target.value)}
            />
            <p className="text-caption text-muted-foreground">{t('world.viewHint')}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mc-world-tick">{t('world.tick')}</Label>
            <Input
              id="mc-world-tick"
              inputMode="numeric"
              value={w.tick}
              aria-invalid={!inRange(w.tick, 4, 12)}
              onChange={e => w.setTick(e.target.value)}
            />
            <p className="text-caption text-muted-foreground">{t('world.tickHint')}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="mc-world-cheats">{t('world.cheats')}</Label>
            <Switch
              id="mc-world-cheats"
              checked={draft.cheats}
              onCheckedChange={cheats => w.patch({ cheats })}
            />
          </div>
        </>
      )}
    </AppDialog>
  );
};
