import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { ArchiveRestore, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import { useMinecraftBackups } from '../hooks/use-minecraft-backups';
import { BackupConfirmDialog } from './BackupConfirmDialog';

/** Backups eines Servers: erstellen, wiederherstellen (nur gestoppt), löschen. */
export const BackupsDrawer: React.FC<{
  serverId: string;
  name: string;
  open: boolean;
  stopped: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ serverId, name, open, stopped, onOpenChange }) => {
  const { t } = useTranslation('minecraft');
  const { backups, reload } = useMinecraftBackups(serverId, open);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<{ mode: 'restore' | 'delete'; file: string } | null>(null);

  const create = async () => {
    setCreating(true);
    const result = await AdminMinecraftApi.backup(serverId);
    setCreating(false);
    if (result.success) {
      toast.success(t('backup.done', { file: result.file, size: ((result.size ?? 0) / 1e6).toFixed(1) }));
      void reload();
    } else {
      toast.error(
        t(`backup.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
    }
  };

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('backup.title', { name })}
      description={t('backup.description')}
      locked={creating}
      action={
        <Button size="sm" isLoading={creating} onClick={() => void create()}>
          <Plus />
          {t('action.backup')}
        </Button>
      }
    >
      {confirm && (
        <BackupConfirmDialog
          {...confirm}
          serverId={serverId}
          onDone={() => void reload()}
          onClose={() => setConfirm(null)}
        />
      )}
      {backups && backups.length === 0 && (
        <p className="text-caption text-muted-foreground">{t('backup.empty')}</p>
      )}
      {!stopped && backups && backups.length > 0 && (
        <p className="pb-2 text-caption text-muted-foreground">{t('backup.stopFirst')}</p>
      )}
      <ul className="flex flex-col">
        {(backups ?? []).map(item => (
          <li
            key={item.file}
            className="flex items-center gap-2 border-t border-border/50 py-2 first:border-t-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium">{new Date(item.createdAt).toLocaleString()}</p>
              <p className="text-caption text-muted-foreground">
                {(item.size / 1e6).toFixed(1)} MB
              </p>
            </div>
            <Button
              variant="outline"
              size="icon-md"
              aria-label={t('backup.restoreConfirm')}
              disabled={!stopped}
              onClick={() => setConfirm({ mode: 'restore', file: item.file })}
            >
              <ArchiveRestore />
            </Button>
            <Button
              variant="ghost"
              size="icon-md"
              aria-label={t('backup.deleteConfirm')}
              onClick={() => setConfirm({ mode: 'delete', file: item.file })}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
    </AppDrawer>
  );
};
