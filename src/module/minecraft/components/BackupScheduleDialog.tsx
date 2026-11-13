import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { IMinecraftBackupSettings } from '../types';

const inRange = (value: string, min: number, max: number) =>
  /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;

/** Zeitplan des Auto-Backups: an/aus, Stunde (Serverzeit), Anzahl behaltener Backups. */
export const BackupScheduleDialog: React.FC<{
  settings: IMinecraftBackupSettings;
  onSave: (next: IMinecraftBackupSettings) => Promise<{ success: boolean }>;
  onClose: () => void;
}> = ({ settings, onSave, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [enabled, setEnabled] = useState(settings.enabled);
  const [hour, setHour] = useState(String(settings.hour));
  const [keep, setKeep] = useState(String(settings.keep));
  const [busy, setBusy] = useState(false);
  const valid = inRange(hour, 0, 23) && inRange(keep, 1, 30);

  const save = async () => {
    setBusy(true);
    const result = await onSave({ enabled, hour: Number(hour), keep: Number(keep) });
    setBusy(false);
    if (!result.success) return void toast.error(t('schedule.error'));
    toast.success(t('schedule.done'));
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && !busy && onClose()}
      title={t('schedule.title')}
      description={t('schedule.text')}
      size="sm"
      bodyClassName="flex flex-col gap-4 p-4"
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button isLoading={busy} disabled={!valid} onClick={() => void save()}>
            {t('form.save')}
          </Button>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="mc-schedule-on">{t('schedule.enabled')}</Label>
        <Switch id="mc-schedule-on" checked={enabled} onCheckedChange={setEnabled} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mc-schedule-hour">{t('schedule.hour')}</Label>
        <Input
          id="mc-schedule-hour"
          inputMode="numeric"
          disabled={!enabled}
          value={hour}
          aria-invalid={!inRange(hour, 0, 23)}
          onChange={event => setHour(event.target.value)}
        />
        <p className="text-caption text-muted-foreground">{t('schedule.hourHint')}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="mc-schedule-keep">{t('schedule.keep')}</Label>
        <Input
          id="mc-schedule-keep"
          inputMode="numeric"
          value={keep}
          aria-invalid={!inRange(keep, 1, 30)}
          onChange={event => setKeep(event.target.value)}
        />
        <p className="text-caption text-muted-foreground">{t('schedule.keepHint')}</p>
      </div>
    </AppDialog>
  );
};
