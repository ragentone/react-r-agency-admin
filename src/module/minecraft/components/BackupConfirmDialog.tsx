import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';

/** Bestätigung zum Wiederherstellen (ersetzt die Welt) oder Löschen eines Backups. */
export const BackupConfirmDialog: React.FC<{
  mode: 'restore' | 'delete';
  serverId: string;
  file: string;
  onDone: () => void;
  onClose: () => void;
}> = ({ mode, serverId, file, onDone, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    const call =
      mode === 'restore' ? AdminMinecraftApi.restoreBackup : AdminMinecraftApi.deleteBackup;
    const result = await call(serverId, file);
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`backup.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t(`backup.${mode}Done`));
    onDone();
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t(`backup.${mode}Title`)}
      description={t(`backup.${mode}Text`, { file })}
      size="sm"
      bodyClassName="p-4"
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button variant="destructive" isLoading={busy} onClick={() => void confirm()}>
            {t(`backup.${mode}Confirm`)}
          </Button>
        </>
      }
    >
      <p className="text-caption break-all text-muted-foreground">{file}</p>
    </AppDialog>
  );
};
