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
    if (!enabled) return undefined;
    let alive = true;
    void AdminMinecraftApi.backups(serverId).then(result => {
      if (alive) setBackups(result.success ? (result.backups ?? []) : []);
    });
    return () => {
      alive = false;
    };
  }, [enabled, serverId]);

  return { backups, reload };
}
