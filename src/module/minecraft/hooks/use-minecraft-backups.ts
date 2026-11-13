import { useCallback, useEffect, useState } from 'react';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftBackupInfo } from '../types';

/** Backups eines Servers; lädt beim Öffnen und auf `reload`. */
export function useMinecraftBackups(serverId: string, enabled: boolean) {
  const [backups, setBackups] = useState<IMinecraftBackupInfo[] | null>(null);

  const reload = useCallback(async () => {
    const result = await AdminMinecraftApi.backups(serverId);
    setBackups(result.success ? (result.backups ?? []) : []);
  }, [serverId]);

  useEffect(() => {
    if (enabled) void reload();
  }, [enabled, reload]);

  return { backups, reload };
}
