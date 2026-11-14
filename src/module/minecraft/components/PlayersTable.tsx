import { Badge } from '@ui/shad-cn/components/badge.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { playerKey } from '../player-key';
import type { IMinecraftPlayer } from '../types';

/** Wo ein Spieler gerade ist (Servernamen) oder wann er zuletzt da war. */
const whereOrWhen = (player: IMinecraftPlayer, never: string): string =>
  player.online.length > 0
    ? player.online.map(item => item.serverName).join(', ')
    : player.lastSeenAt
      ? new Date(player.lastSeenAt).toLocaleString()
      : never;

/** Spieler als Tabelle (Tipp auf eine Zeile öffnet die Details); Alias und Ort ab `sm` eigene Spalten. */
export const PlayersTable: React.FC<{
  players: IMinecraftPlayer[];
  onSelect: (player: IMinecraftPlayer) => void;
}> = ({ players, onSelect }) => {
  const { t } = useTranslation('minecraft');
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/50">
          <TableHead>{t('pass.table.gamertag')}</TableHead>
          <TableHead className="hidden sm:table-cell">{t('pass.table.alias')}</TableHead>
          <TableHead className="hidden sm:table-cell">{t('playerList.table.where')}</TableHead>
          <TableHead>{t('pass.table.status')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map(player => {
          const online = player.online.length > 0;
          const where = whereOrWhen(player, t('pass.never'));
          return (
            <TableRow
              key={playerKey(player)}
              className="cursor-pointer border-border/50"
              tabIndex={0}
              onClick={() => onSelect(player)}
              onKeyDown={event => event.key === 'Enter' && onSelect(player)}
            >
              <TableCell className="max-w-48 sm:max-w-none">
                <p className="flex items-center gap-2 truncate font-bold">
                  <span
                    role="img"
                    aria-label={online ? t('playerList.online') : t('playerList.offline')}
                    className={`size-2 shrink-0 rounded-full ${online ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
                  />
                  <span className="truncate">{player.gamertag}</span>
                </p>
                <p className="truncate text-caption text-muted-foreground sm:hidden">
                  {player.alias ? `${player.alias} · ` : ''}
                  {online ? t('playerList.onlineOn', { server: where }) : where}
                </p>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {player.alias ?? '–'}
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {online ? t('playerList.onlineOn', { server: where }) : where}
              </TableCell>
              <TableCell>
                <Badge variant={player.status === 'active' ? 'default' : 'secondary'}>
                  {t(`playerList.status.${player.status}`)}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
