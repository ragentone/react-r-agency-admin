import { cn } from '@ui/lib';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { Pencil, Play, RotateCcw, Square, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMinecraftApi } from '../api';
import type { IMinecraftRunState, IMinecraftServerEntry } from '../types';

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
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-title font-bold">{server.name}</h3>
            <p className="text-caption text-muted-foreground">
              {t(`gamemode.${server.gamemode}`)} · {t('card.port', { port: server.port })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
          {state && (
            <Badge
              className={cn({
                'text-white': state === 'crashed',
              })}
              variant={BADGE_VARIANT[state]}
            >
              {t(`state.${state}`)}
            </Badge>
          )}
            <Button variant="ghost" size="icon-md" aria-label={t('action.edit')} onClick={onEdit}>
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-md"
              aria-label={t('action.delete')}
              disabled={!canStart}
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between gap-4 border-t border-border/50 py-2 text-caption">
            <span className="text-muted-foreground">{t('card.pid')}</span>
            <span className="tabular-nums">{status.pid ?? '–'}</span>
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

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon-lg"
                aria-label={t('action.start')}
                disabled={!canStart || busy !== null}
                isLoading={busy === 'start'}
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
