import { AppDialog } from '@ui/components';
import { Avatar, AvatarFallback } from '@ui/shad-cn/components/avatar.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu.tsx';
import { Ban, CircleCheck, Ellipsis, MessageSquare, Trash2, UserX } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftPlayer } from '../types';

const Tile: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex min-w-0 flex-col gap-0.5 rounded-xl border border-border/50 p-3">
    <span className="text-caption text-muted-foreground">{label}</span>
    <span className="min-w-0 wrap-break-word text-body font-medium">{children}</span>
  </div>
);

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Details eines Spielers: Stammdaten, wo er online ist, Rauswerfen, Sperren, Löschen. */
export const PlayerDetailsDialog: React.FC<{
  player: IMinecraftPlayer;
  onChanged: () => void;
  onKick: (serverId: string, name: string) => void;
  onMessage: (serverId: string, serverName: string, name: string) => void;
  onDelete: (player: IMinecraftPlayer) => void;
  onClose: () => void;
}> = ({ player, onChanged, onKick, onMessage, onDelete, onClose }) => {
  const { t } = useTranslation('minecraft');
  const [busy, setBusy] = useState(false);
  const blocked = player.status === 'blocked';
  const never = t('pass.never');
  const date = (iso: string | null, fallback = '–') => (iso ? new Date(iso).toLocaleString() : fallback);

  const toggleBlock = async () => {
    if (!player.id) return;
    setBusy(true);
    const result = await AdminMinecraftApi.blockPass(player.id, !blocked);
    setBusy(false);
    if (!result.success) {
      toast.error(t('action.error.unknown'));
      return;
    }
    onChanged();
  };

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={player.gamertag}
      description={t(`playerList.status.${player.status}`)}
      headerStart={
        <Avatar className="size-9">
          <AvatarFallback className="bg-foreground text-background font-bold">
            {player.gamertag.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      }
      size="md"
      bodyClassName="flex flex-col gap-5 p-4 sm:p-6"
      headerEnd={
        player.id ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-md" aria-label={t('playerList.more')}>
                <Ellipsis className="size-4.5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56">
              <DropdownMenuItem disabled={busy} onSelect={() => void toggleBlock()}>
                {blocked ? <CircleCheck /> : <Ban />}
                {blocked ? t('pass.unblock') : t('pass.block')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(player)}>
                <Trash2 />
                {t('pass.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Tile label={t('pass.table.alias')}>{player.alias ?? '–'}</Tile>
        <Tile label={t('pass.table.lastSeen')}>{date(player.lastSeenAt, never)}</Tile>
        <Tile label={t('playerList.xuid')}>{player.xuid ?? t('playerList.unknown')}</Tile>
        <Tile label={t('playerList.created')}>{date(player.createdAt)}</Tile>
      </div>
      <section className="flex flex-col gap-2">
        <h4 className="text-body font-bold">{t('playerList.onlineTitle')}</h4>
        {player.online.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/50 p-4 text-center text-caption text-muted-foreground">
            {t('playerList.offline')}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {player.online.map(item => (
              <li key={item.serverId} className="flex flex-col gap-3 rounded-xl border border-border/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    <span className="size-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
                    <span className="truncate">{item.serverName}</span>
                  </span>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {t('players.since', { time: time(item.joinedAt) })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => onMessage(item.serverId, item.serverName, player.gamertag)}>
                    <MessageSquare />
                    {t('playerList.messageAction')}
                  </Button>
                  <Button variant="outline" onClick={() => onKick(item.serverId, player.gamertag)}>
                    <UserX />
                    {t('playerList.kickAction')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {player.status === 'unlisted' && (
          <p className="text-caption text-muted-foreground">{t('playerList.unlistedHint')}</p>
        )}
      </section>
    </AppDialog>
  );
};
