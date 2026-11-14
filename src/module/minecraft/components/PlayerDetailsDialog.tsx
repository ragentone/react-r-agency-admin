import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Ban, CircleCheck, Trash2, UserX } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftPlayer } from '../types';

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex justify-between gap-4 border-t border-border/50 py-2 text-caption first:border-t-0">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="min-w-0 break-words text-right">{children}</span>
  </div>
);

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Details eines Spielers: Stammdaten, wo er online ist, Rauswerfen, Sperren, Löschen. */
export const PlayerDetailsDialog: React.FC<{
  player: IMinecraftPlayer;
  onChanged: () => void;
  onKick: (serverId: string, name: string) => void;
  onDelete: (player: IMinecraftPlayer) => void;
  onClose: () => void;
}> = ({ player, onChanged, onKick, onDelete, onClose }) => {
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
      size="sm"
      bodyClassName="p-4"
      footer={
        player.id ? (
          <>
            <Button variant="outline" isLoading={busy} onClick={() => void toggleBlock()}>
              {blocked ? <CircleCheck /> : <Ban />}
              {blocked ? t('pass.unblock') : t('pass.block')}
            </Button>
            <Button variant="destructive" onClick={() => onDelete(player)}>
              <Trash2 />
              {t('pass.delete')}
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="flex flex-col">
        <Row label={t('pass.table.alias')}>{player.alias ?? '–'}</Row>
        <Row label={t('playerList.xuid')}>{player.xuid ?? t('playerList.unknown')}</Row>
        <Row label={t('pass.table.lastSeen')}>{date(player.lastSeenAt, never)}</Row>
        <Row label={t('playerList.created')}>{date(player.createdAt)}</Row>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <h4 className="text-caption font-bold">{t('playerList.onlineTitle')}</h4>
        {player.online.length === 0 ? (
          <p className="text-caption text-muted-foreground">{t('playerList.offline')}</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {player.online.map(item => (
              <li key={item.serverId} className="flex items-center justify-between gap-3 text-caption">
                <span className="min-w-0 truncate font-medium">{item.serverName}</span>
                <span className="shrink-0 text-muted-foreground">
                  {t('players.since', { time: time(item.joinedAt) })}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t('kick.action', { name: player.gamertag })}
                  onClick={() => onKick(item.serverId, player.gamertag)}
                >
                  <UserX />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {player.status === 'unlisted' && (
          <p className="text-caption text-muted-foreground">{t('playerList.unlistedHint')}</p>
        )}
      </div>
    </AppDialog>
  );
};
