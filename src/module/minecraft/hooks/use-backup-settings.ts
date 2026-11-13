import { useCallback, useEffect, useState } from 'react';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftBackupSettings } from '../types';

/** Auto-Backup-Zeitplan; lädt beim Öffnen und nach `save`. `null`, solange er lädt. */
export function useBackupSettings(enabled: boolean) {
  const [settings, setSettings] = useState<IMinecraftBackupSettings | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    void AdminMinecraftApi.backupSettings().then(result => {
      if (alive && result.success && result.settings) setSettings(result.settings);
    });
    return () => {
      alive = false;
    };
  }, [enabled]);

  const save = useCallback(async (next: IMinecraftBackupSettings) => {
    const result = await AdminMinecraftApi.saveBackupSettings(next);
    if (result.success && result.settings) setSettings(result.settings);
    return result;
  }, []);

  return { settings, save };
}
