import { cn } from '@ui/lib';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { TableCell, TableRow } from '@ui/shad-cn/components/table.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { ChevronDown, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftRunState, IMinecraftServerEntry } from '../types';
import { type CardAction, MinecraftCardActions } from './MinecraftCardActions';
import { MinecraftCardMenu } from './MinecraftCardMenu';
import { formatMemory } from './MinecraftMetricsRow';
import { type MinecraftDialog, MinecraftServerDialogs } from './MinecraftServerDialogs';
import { MinecraftServerInfo } from './MinecraftServerInfo';

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

/** Ein Server als Tabellenzeile (+ aufklappbare Details); Dialoge hängen an der Zeile. */
export const MinecraftServerRow: React.FC<{
  entry: IMinecraftServerEntry;
  onChanged: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ entry, onChanged: reload, onEdit, onDelete }) => {
  const { t } = useTranslation('minecraft');
  const { server, status, players = [], metrics } = entry;
  const state = status.state;
  const [busy, setBusy] = useState<CardAction | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dialog, setDialog] = useState<MinecraftDialog | null>(null);
  const [kicking, setKicking] = useState<string | null>(null);
  const canStart = state === 'stopped' || state === 'crashed';

  const run = async (action: CardAction) => {
    setBusy(action);
    const result = await AdminMinecraftApi[action](server.id);
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

  return (
    <>
      <TableRow className={cn('border-border/50', expanded && 'border-b-0')}>
        <TableCell className="max-w-44 sm:max-w-none">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-expanded={expanded}
              aria-label={t(expanded ? 'list.collapse' : 'list.expand', { name: server.name })}
              onClick={() => setExpanded(open => !open)}
            >
              <ChevronDown className={cn('transition-transform', expanded && 'rotate-180')} />
            </Button>
            <div className="min-w-0">
              <p className="truncate font-bold">{server.name}</p>
              <p className="truncate text-caption text-muted-foreground">
                {t(`gamemode.${server.gamemode}`)} · {t('card.port', { port: server.port })}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          {state && (
            <Badge
              className={cn({ 'text-white': state === 'crashed' })}
              variant={BADGE_VARIANT[state]}
            >
              {t(`state.${state}`)}
            </Badge>
          )}
        </TableCell>
        <TableCell className="hidden tabular-nums sm:table-cell">
          {state === 'running' ? `${players.length} / ${server.maxPlayers}` : '–'}
        </TableCell>
        <TableCell className="hidden whitespace-nowrap tabular-nums text-muted-foreground md:table-cell">
          {metrics ? `${metrics.cpu.toFixed(1)} % · ${formatMemory(metrics.memBytes)}` : '–'}
        </TableCell>
        <TableCell>
          <div className="flex items-center justify-end gap-2">
            <MinecraftCardActions state={state} busy={busy} onRun={action => void run(action)} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-lg"
                  aria-label={t('playerList.serverButton', { name: server.name })}
                  onClick={() => setDialog('players')}
                >
                  <Users />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('playerList.title')}</TooltipContent>
            </Tooltip>
            <MinecraftCardMenu
              canBroadcast={state === 'running'}
              canGamerules={state === 'running'}
              canDelete={canStart}
              onBackups={() => setDialog('backups')}
              onWorld={() => setDialog('world')}
              onGamerules={() => setDialog('rules')}
              onBroadcast={() => setDialog('broadcast')}
              onTerminal={() => setDialog('terminal')}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="border-border/50 hover:bg-transparent">
          <TableCell colSpan={5} className="whitespace-normal pt-0">
            <MinecraftServerInfo entry={entry} onKick={setKicking} />
          </TableCell>
        </TableRow>
      )}
      <MinecraftServerDialogs
        server={server}
        state={state}
        dialog={dialog}
        kicking={kicking}
        onClose={() => setDialog(null)}
        onKickClose={() => setKicking(null)}
      />
    </>
  );
};
