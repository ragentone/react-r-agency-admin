import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Archive, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import { formatSize } from '../format-size';
import { useBackupDownload } from '../hooks/use-backup-download';
import { useMinecraftBackups } from '../hooks/use-minecraft-backups';
import { BackupConfirmDialog } from './BackupConfirmDialog';
import { BackupRowMenu } from './BackupRowMenu';

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
  const { download, downloading } = useBackupDownload(serverId);
  const [creating, setCreating] = useState(false);
  const [confirm, setConfirm] = useState<{ mode: 'restore' | 'delete'; file: string } | null>(null);

  const create = async () => {
    setCreating(true);
    const result = await AdminMinecraftApi.backup(serverId);
    setCreating(false);
    if (result.success) {
      toast.success(t('backup.done', { file: result.file, size: formatSize(result.size ?? 0) }));
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
      contentProps={{ className: 'max-w-5xl' }}
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
        <Empty className="px-4 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Archive />
            </EmptyMedia>
            <EmptyTitle>{t('backup.empty')}</EmptyTitle>
            <EmptyDescription>{t('backup.emptyText')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button isLoading={creating} onClick={() => void create()}>
              <Plus />
              {t('action.backup')}
            </Button>
          </EmptyContent>
        </Empty>
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
              <p className="text-caption text-muted-foreground">{formatSize(item.size)}</p>
            </div>
            <BackupRowMenu
              stopped={stopped}
              busy={downloading === item.file}
              onDownload={() => void download(item.file)}
              onRestore={() => setConfirm({ mode: 'restore', file: item.file })}
              onDelete={() => setConfirm({ mode: 'delete', file: item.file })}
            />
          </li>
        ))}
      </ul>
    </AppDrawer>
  );
};
