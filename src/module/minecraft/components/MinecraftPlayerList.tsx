import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { UserX } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMinecraftOnlinePlayer } from '../types';

/** Online-Spieler eines Servers (nur im Admin sichtbar, Kinder-Gamertags nie öffentlich). */
export const MinecraftPlayerList: React.FC<{
  players: IMinecraftOnlinePlayer[];
  max: number;
  active: boolean;
  onKick: (name: string) => void;
}> = ({ players, max, active, onKick }) => {
  const { t } = useTranslation('minecraft');
  return (
    <div className="flex flex-col border-t border-border/50 py-2 text-caption">
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">{t('players.title')}</span>
        <span className="tabular-nums">{active ? `${players.length} / ${max}` : '–'}</span>
      </div>
      {active && players.length === 0 && (
        <p className="pt-2 text-muted-foreground">{t('players.empty')}</p>
      )}
      {players.length > 0 && (
        <ul className="flex flex-col gap-1.5 pt-2">
          {players.map(player => (
            <li key={player.xuid} className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate font-medium">{player.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto shrink-0"
                aria-label={t('kick.action', { name: player.name })}
                onClick={() => onKick(player.name)}
              >
                <UserX />
              </Button>
              <Badge variant="outline" className="shrink-0 tabular-nums">
                {t('players.since', {
                  time: new Date(player.joinedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                })}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
