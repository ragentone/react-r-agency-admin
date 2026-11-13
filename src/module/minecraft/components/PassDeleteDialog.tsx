import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftPass } from '../types';

/** Bestätigung: Eintrag löschen, Gamertag überall aus der Allowlist nehmen und kicken. */
export const PassDeleteDialog: React.FC<{
  pass: IMinecraftPass;
  onDone: () => void;
  onClose: () => void;
}> = ({ pass, onDone, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    const result = await AdminMinecraftApi.deletePass(pass.id);
    setBusy(false);
    if (!result.success) {
      toast.error(t('action.error.unknown'));
      return;
    }
    toast.success(t('pass.deleteDone'));
    onDone();
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('pass.deleteTitle')}
      description={t('pass.deleteText', { name: pass.gamertag })}
      size="sm"
      bodyClassName="p-4"
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button variant="destructive" isLoading={busy} onClick={() => void confirm()}>
            {t('pass.delete')}
          </Button>
        </>
      }
    >
      <p className="text-caption text-muted-foreground">{pass.alias}</p>
    </AppDialog>
  );
};
