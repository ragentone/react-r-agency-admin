import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { EllipsisVertical, Pencil, Play, Square, Trash2, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** Aktionen einer Aufgabe: Fortschritt, Aktivieren/Beenden, Bearbeiten (nicht aktiv), Löschen. */
export const QuestRowMenu: React.FC<{
  active: boolean;
  busy: boolean;
  onProgress: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ active, busy, onProgress, onToggle, onEdit, onDelete }) => {
  const { t } = useTranslation('minecraft');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-md" isLoading={busy} aria-label={t('quest.menu')}>
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onSelect={onToggle}>
          {active ? <Square /> : <Play />}
          {t(active ? 'quest.end' : 'quest.activate')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onProgress}>
          <Users />
          {t('quest.progress.menu')}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={active} onSelect={onEdit}>
          <Pencil />
          {t('action.edit')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 />
          {t('action.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
