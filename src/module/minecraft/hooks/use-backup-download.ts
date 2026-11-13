import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';

const origin = (): string =>
  String(import.meta.env.VITE_MESH_SERVER_ENDPOINT ?? '').replace(/\/+$/, '');

/** Holt einen Einmal-Link (60 s) und startet den Browser-Download des Backups. */
export function useBackupDownload(serverId: string) {
  const { t } = useTranslation('minecraft');
  const [file, setFile] = useState<string | null>(null);

  const download = async (name: string) => {
    setFile(name);
    const result = await AdminMinecraftApi.backupLink(serverId, name);
    setFile(null);
    if (!result.success || !result.token) {
      toast.error(
        t(`backup.linkError.${result.error ?? 'unknown'}`, {
          defaultValue: t('backup.linkError.unknown'),
        })
      );
      return;
    }
    const link = document.createElement('a');
    link.href = `${origin()}/minecraft-backup/${result.token}`;
    link.rel = 'noopener';
    document.body.append(link);
    link.click();
    link.remove();
  };

  return { download, downloading: file };
}
