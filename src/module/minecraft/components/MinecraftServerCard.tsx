import { cn } from '@ui/lib';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftRunState, IMinecraftServerEntry } from '../types';
import { BackupsDrawer } from './BackupsDrawer';
import { BroadcastDialog } from './BroadcastDialog';
import { GamerulesDialog } from './GamerulesDialog';
import { KickPlayerDialog } from './KickPlayerDialog';
import { type CardAction, MinecraftCardActions } from './MinecraftCardActions';
import { MinecraftCardMenu } from './MinecraftCardMenu';
import { MinecraftServerInfo } from './MinecraftServerInfo';
import { MinecraftTerminal } from './MinecraftTerminal';
import { WorldSettingsDialog } from './WorldSettingsDialog';

type Action = CardAction;

const BADGE_VARIANT: Record<
  IMinecraftRunState,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  running: 'default',
  starting: 'secondary',
  stopping: 'secondary',
  stopped: 'outline',
  crashed: 'destructive',
};

/** Server-Karte: Name, Spielmodus, Port, Zustand, Start/Stop/Restart als Icon-Buttons. */
export const MinecraftServerCard: React.FC<{
  entry: IMinecraftServerEntry;
  onChanged: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ entry, onChanged: reload, onEdit, onDelete }) => {
  const { t } = useTranslation('minecraft');
  const { server, status } = entry;
  const [busy, setBusy] = useState<Action | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [kicking, setKicking] = useState<string | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [backupsOpen, setBackupsOpen] = useState(false);
  const [worldOpen, setWorldOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const run = async (
    action: Action,
    fn: () => Promise<{ success: boolean; error?: string | null }>
  ) => {
    setBusy(action);
    const result = await fn();
    setBusy(null);
    if (result.success) {
      toast.success(t(`action.${action}Done`));
      reload();
    } else {
      toast.error(
        t(`action.error.${result.error ?? 'unknown'}`, { defaultValue: t('action.error.unknown') })
      );
    }
  };

  const state = status.state;
  const canStart = state === 'stopped' || state === 'crashed';

  return (
    <Card className="relative rounded-xl border-border/50 shadow-none">
      {(state === 'running' || state === 'starting') && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute -inset-px animate-pulse rounded-xl ring-2 motion-reduce:animate-none',
            state === 'running' ? 'ring-green-500' : 'ring-yellow-500'
          )}
        />
      )}
      {kicking && (
        <KickPlayerDialog serverId={server.id} name={kicking} onClose={() => setKicking(null)} />
      )}
      {broadcasting && (
        <BroadcastDialog
          serverId={server.id}
          name={server.name}
          onClose={() => setBroadcasting(false)}
        />
      )}
      {rulesOpen && (
        <GamerulesDialog
          serverId={server.id}
          name={server.name}
          onClose={() => setRulesOpen(false)}
        />
      )}
      {worldOpen && (
        <WorldSettingsDialog
          serverId={server.id}
          name={server.name}
          onClose={() => setWorldOpen(false)}
        />
      )}
      <BackupsDrawer
        serverId={server.id}
        name={server.name}
        open={backupsOpen}
        stopped={canStart}
        onOpenChange={setBackupsOpen}
      />
      <MinecraftTerminal
        serverId={server.id}
        name={server.name}
        open={terminalOpen}
        canSend={state === 'running' || state === 'starting'}
        onOpenChange={setTerminalOpen}
      />
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-title font-bold break-words">{server.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              {state && (
                <Badge
                  className={cn({ 'text-white': state === 'crashed' })}
                  variant={BADGE_VARIANT[state]}
                >
                  {t(`state.${state}`)}
                </Badge>
              )}
              <span className="text-caption text-muted-foreground">
                {t(`gamemode.${server.gamemode}`)} · {t('card.port', { port: server.port })}
              </span>
            </div>
          </div>
          <MinecraftCardMenu
            canBroadcast={state === 'running'}
            canGamerules={state === 'running'}
            canDelete={canStart}
            onBackups={() => setBackupsOpen(true)}
            onWorld={() => setWorldOpen(true)}
            onGamerules={() => setRulesOpen(true)}
            onBroadcast={() => setBroadcasting(true)}
            onTerminal={() => setTerminalOpen(true)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        <MinecraftServerInfo entry={entry} onKick={setKicking} />

        <MinecraftCardActions
          state={state}
          busy={busy}
          onRun={action => void run(action, () => AdminMinecraftApi[action](server.id))}
        />
      </CardContent>
    </Card>
  );
};
