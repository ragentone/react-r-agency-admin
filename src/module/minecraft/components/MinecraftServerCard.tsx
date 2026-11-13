import { cn } from '@ui/lib';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { Play, RotateCcw, Square } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftRunState, IMinecraftServerEntry } from '../types';
import { BroadcastDialog } from './BroadcastDialog';
import { KickPlayerDialog } from './KickPlayerDialog';
import { MinecraftCardMenu } from './MinecraftCardMenu';
import { MinecraftServerInfo } from './MinecraftServerInfo';
import { MinecraftTerminal } from './MinecraftTerminal';

type Action = 'start' | 'stop' | 'restart';

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
  const canStop = state === 'running' || state === 'starting';

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
            canDelete={canStart}
            onBroadcast={() => setBroadcasting(true)}
            onTerminal={() => setTerminalOpen(true)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>

        <MinecraftServerInfo entry={entry} onKick={setKicking} />

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon-lg"
                aria-label={t('action.start')}
                disabled={!canStart || busy !== null}
                isLoading={busy === 'start' || state === 'starting' || state === 'stopping'}
                onClick={() => void run('start', () => AdminMinecraftApi.start(server.id))}
              >
                <Play />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('action.start')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-lg"
                aria-label={t('action.restart')}
                disabled={!canStop || busy !== null}
                isLoading={busy === 'restart'}
                onClick={() => void run('restart', () => AdminMinecraftApi.restart(server.id))}
              >
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('action.restart')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon-lg"
                aria-label={t('action.stop')}
                disabled={!canStop || busy !== null}
                isLoading={busy === 'stop'}
                onClick={() => void run('stop', () => AdminMinecraftApi.stop(server.id))}
              >
                <Square />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('action.stop')}</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
};
