import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Plus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMinecraftPlayers } from '../hooks/use-minecraft-players';
import { playerKey } from '../player-key';
import type { IMinecraftPlayer } from '../types';
import { KickPlayerDialog } from './KickPlayerDialog';
import { MessagePlayerDialog } from './MessagePlayerDialog';
import { PassAddDialog } from './PassAddDialog';
import { PassDeleteDialog } from './PassDeleteDialog';
import { PlayerDetailsDialog } from './PlayerDetailsDialog';
import { PlayersTable } from './PlayersTable';

const matches = (player: IMinecraftPlayer, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  return (
    !needle ||
    player.gamertag.toLowerCase().includes(needle) ||
    (player.alias ?? '').toLowerCase().includes(needle)
  );
};

/**
 * Alle Spieler (Spielerpass + online), online zuerst; Tipp auf eine Zeile zeigt die Details.
 * Mit `server`: nur die Spieler, die gerade auf diesem Server online sind.
 */
export const PlayersDrawer: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server?: { id: string; name: string };
}> = ({ open, onOpenChange, server }) => {
  const { t } = useTranslation('minecraft');
  const { players, reload } = useMinecraftPlayers(open);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<IMinecraftPlayer | null>(null);
  const [kicking, setKicking] = useState<{ serverId: string; name: string } | null>(null);
  const [messaging, setMessaging] = useState<{
    serverId: string;
    serverName: string;
    name: string;
  } | null>(null);
  const [adding, setAdding] = useState(false);

  // Details aus der aktuellen Liste: bleiben nach Sperren/Polling frisch.
  const details = players?.find(player => playerKey(player) === selected) ?? null;
  const scope = (players ?? []).filter(
    player => !server || player.online.some(item => item.serverId === server.id)
  );
  const shown = scope.filter(player => matches(player, query));
  const onlineCount = scope.filter(player => player.online.length > 0).length;

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={server ? t('playerList.serverTitle', { name: server.name }) : t('playerList.title')}
      description={
        !players
          ? ''
          : server
            ? t('playerList.serverSummary', { count: scope.length })
            : t('playerList.summary', { online: onlineCount, total: players.length })
      }
      action={
        server ? undefined : (
          <Button
            variant="ghost"
            size="icon-md"
            aria-label={t('pass.add')}
            onClick={() => setAdding(true)}
          >
            <Plus />
          </Button>
        )
      }
      contentProps={{ className: 'max-w-5xl' }}
    >
      {adding && <PassAddDialog onDone={() => void reload()} onClose={() => setAdding(false)} />}
      {deleting?.id && (
        <PassDeleteDialog
          pass={{ id: deleting.id, gamertag: deleting.gamertag, alias: deleting.alias ?? '' }}
          onDone={() => void reload()}
          onClose={() => setDeleting(null)}
        />
      )}
      {kicking && (
        <KickPlayerDialog
          serverId={kicking.serverId}
          name={kicking.name}
          onClose={() => {
            setKicking(null);
            void reload();
          }}
        />
      )}
      {messaging && (
        <MessagePlayerDialog
          serverId={messaging.serverId}
          serverName={messaging.serverName}
          name={messaging.name}
          onClose={() => setMessaging(null)}
        />
      )}
      {details && !deleting && !kicking && !messaging && (
        <PlayerDetailsDialog
          player={details}
          onChanged={() => void reload()}
          onKick={(serverId, name) => setKicking({ serverId, name })}
          onMessage={(serverId, serverName, name) => setMessaging({ serverId, serverName, name })}
          onDelete={player => setDeleting(player)}
          onClose={() => setSelected(null)}
        />
      )}
      {scope.length > 0 && (
        <div className="border-b border-border/50 p-3">
          <Input
            value={query}
            placeholder={t('playerList.search')}
            onChange={event => setQuery(event.target.value)}
          />
        </div>
      )}
      {players && scope.length === 0 && (
        <Empty className="px-4 py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>{server ? t('players.empty') : t('pass.empty')}</EmptyTitle>
            {!server && <EmptyDescription>{t('pass.emptyText')}</EmptyDescription>}
          </EmptyHeader>
        </Empty>
      )}
      {scope.length > 0 && shown.length === 0 && (
        <p className="px-4 py-8 text-center text-caption text-muted-foreground">
          {t('playerList.noMatch')}
        </p>
      )}
      {shown.length > 0 && <PlayersTable players={shown} onSelect={p => setSelected(playerKey(p))} />}
    </AppDrawer>
  );
};
