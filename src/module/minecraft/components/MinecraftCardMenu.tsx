import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { Archive, EllipsisVertical, Megaphone, Pencil, Terminal, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Menü im Kartenkopf: Nachricht an alle, Terminal, Bearbeiten, Löschen. */
export const MinecraftCardMenu: React.FC<{
  canBroadcast: boolean;
  canDelete: boolean;
  onBackups: () => void;
  onBroadcast: () => void;
  onTerminal: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ canBroadcast, canDelete, onBackups, onBroadcast, onTerminal, onEdit, onDelete }) => {
  const { t } = useTranslation('minecraft');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-md" aria-label={t('card.menu')}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onSelect={onTerminal}>
          <Terminal />
          {t('action.terminal')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canBroadcast} onSelect={onBroadcast}>
          <Megaphone />
          {t('action.broadcast')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onBackups}>
          <Archive />
          {t('action.backups')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil />
          {t('action.edit')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={!canDelete} onSelect={onDelete}>
          <Trash2 />
          {t('action.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
