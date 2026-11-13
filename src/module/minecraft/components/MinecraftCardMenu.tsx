import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import {
  Archive,
  EllipsisVertical,
  ListChecks,
  Megaphone,
  Pencil,
  SlidersHorizontal,
  Terminal,
  Trash2,
} from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Menü im Kartenkopf: Nachricht an alle, Terminal, Bearbeiten, Löschen. */
export const MinecraftCardMenu: React.FC<{
  canBroadcast: boolean;
  canGamerules: boolean;
  canDelete: boolean;
  onBackups: () => void;
  onWorld: () => void;
  onGamerules: () => void;
  onBroadcast: () => void;
  onTerminal: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({
  canBroadcast,
  canGamerules,
  canDelete,
  onBackups,
  onWorld,
  onGamerules,
  onBroadcast,
  onTerminal,
  onEdit,
  onDelete,
}) => {
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
        <DropdownMenuItem disabled={!canGamerules} onSelect={onGamerules}>
          <ListChecks />
          {t('action.gamerules')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onWorld}>
          <SlidersHorizontal />
          {t('action.world')}
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
