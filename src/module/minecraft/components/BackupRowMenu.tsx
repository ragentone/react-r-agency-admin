import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { ArchiveRestore, Download, EllipsisVertical, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Aktionen einer Backup-Zeile: Herunterladen, Wiederherstellen (nur gestoppt), Löschen. */
export const BackupRowMenu: React.FC<{
  stopped: boolean;
  busy: boolean;
  onDownload: () => void;
  onRestore: () => void;
  onDelete: () => void;
}> = ({ stopped, busy, onDownload, onRestore, onDelete }) => {
  const { t } = useTranslation('minecraft');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-md" isLoading={busy} aria-label={t('backup.menu')}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onSelect={onDownload}>
          <Download />
          {t('backup.download')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!stopped} onSelect={onRestore}>
          <ArchiveRestore />
          {t('backup.restoreConfirm')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 />
          {t('backup.deleteConfirm')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
