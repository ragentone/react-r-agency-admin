import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftServer } from '../types';

/** Bestätigung zum Löschen: Server und Container verschwinden, Ordner und Welt nur mit Häkchen. */
export const DeleteServerDialog: React.FC<{
  server: IMinecraftServer;
  onDeleted: () => void;
  onClose: () => void;
}> = ({ server, onDeleted, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [busy, setBusy] = useState(false);
  const [deleteFiles, setDeleteFiles] = useState(true);

  const remove = async () => {
    setBusy(true);
    const result = await AdminMinecraftApi.remove(server.id, deleteFiles);
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
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/50 p-3 select-none">
        <Checkbox
          checked={deleteFiles}
          disabled={busy}
          onCheckedChange={value => setDeleteFiles(value === true)}
          className="mt-0.5"
        />
        <span className="flex flex-col gap-0.5">
          <span className="text-body font-medium">{t('delete.deleteFiles')}</span>
          <span className="text-caption text-muted-foreground">
            {deleteFiles
              ? t('delete.filesWarning', { folder: `servers/${server.slug}` })
              : t('delete.worldKept', { folder: `servers/${server.slug}` })}
          </span>
        </span>
      </label>
    </AppDialog>
  );
};
