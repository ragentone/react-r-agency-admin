import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMinecraftServerEntry } from '../types';
import { MinecraftMetricsRow } from './MinecraftMetricsRow';
import { MinecraftPlayerList } from './MinecraftPlayerList';

/** Info-Zeilen einer Server-Karte: Spieler, CPU/RAM, Container/PID, Start, Neustarts, Fehler. */
export const MinecraftServerInfo: React.FC<{
  entry: IMinecraftServerEntry;
  onKick: (name: string) => void;
}> = ({ entry, onKick }) => {
  const { t } = useTranslation('minecraft');
  const { server, status, players = [], metrics } = entry;
  const state = status.state;

  return (
    <div className="flex flex-col">
      <MinecraftPlayerList
        players={players}
        max={server.maxPlayers}
        active={state === 'running'}
        onKick={onKick}
      />
      <MinecraftMetricsRow metrics={metrics} />
      <div className="flex justify-between gap-4 border-t border-border/50 py-2 text-caption">
        <span className="text-muted-foreground">
          {status.container ? t('card.container') : t('card.pid')}
        </span>
        <span className="tabular-nums">{status.container ?? status.pid ?? '–'}</span>
      </div>
      <div className="flex justify-between gap-4 border-t border-border/50 py-2 text-caption">
        <span className="text-muted-foreground">{t('card.startedAt')}</span>
        <span className="tabular-nums">
          {status.startedAt ? new Date(status.startedAt).toLocaleString() : '–'}
        </span>
      </div>
      <div className="flex justify-between gap-4 border-t border-border/50 py-2 text-caption">
        <span className="text-muted-foreground">{t('card.restartAttempts')}</span>
        <span className="tabular-nums">{status.restartAttempts}</span>
      </div>
      {status.lastError && state === 'crashed' && (
        <p className="border-t border-border/50 py-2 text-caption break-words text-destructive">
          {t('card.lastError')}: {status.lastError}
        </p>
      )}
    </div>
  );
};
