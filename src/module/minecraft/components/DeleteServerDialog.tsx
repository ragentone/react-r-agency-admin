import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftServer } from '../types';

/** Bestätigung zum Löschen: Server und Container verschwinden, die Welt auf der Platte bleibt. */
export const DeleteServerDialog: React.FC<{
  server: IMinecraftServer;
  onDeleted: () => void;
  onClose: () => void;
}> = ({ server, onDeleted, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const result = await AdminMinecraftApi.remove(server.id);
    setBusy(false);
    if (!result.success) {
      toast.error(
        t(`action.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
      return;
    }
    toast.success(t('delete.done'));
    onDeleted();
    onClose();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('delete.title', { name: server.name })}
      description={t('delete.text')}
      size="sm"
      bodyClassName="p-4"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('form.cancel')}
          </Button>
          <Button variant="destructive" isLoading={busy} onClick={() => void remove()}>
            {t('delete.confirm')}
          </Button>
        </>
      }
    >
      <p className="text-caption text-muted-foreground">
        {t('delete.worldKept', { folder: `servers/${server.slug}` })}
      </p>
    </AppDialog>
  );
};
