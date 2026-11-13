import { Button } from '@ui/shad-cn/components/button.tsx';
import { CalendarClock } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IMinecraftBackupSettings } from '../types';
import { BackupScheduleDialog } from './BackupScheduleDialog';

/** Zeile über der Backup-Liste: aktueller Zeitplan und "Ändern". */
export const BackupScheduleRow: React.FC<{
  settings: IMinecraftBackupSettings | null;
  onSave: (next: IMinecraftBackupSettings) => Promise<{ success: boolean }>;
}> = ({ settings, onSave }) => {
  const { t } = useTranslation('minecraft');
  const [open, setOpen] = useState(false);
  if (!settings) return null;
  const time = `${String(settings.hour).padStart(2, '0')}:00`;

  return (
    <div className="mb-2 flex items-center gap-3 rounded-xl border border-border/50 p-3">
      <CalendarClock className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <p className="min-w-0 flex-1 text-caption text-muted-foreground">
        {settings.enabled
          ? t('schedule.summary', { time, keep: settings.keep })
          : t('schedule.off')}
      </p>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {t('schedule.change')}
      </Button>
      {open && (
        <BackupScheduleDialog settings={settings} onSave={onSave} onClose={() => setOpen(false)} />
      )}
    </div>
  );
};
