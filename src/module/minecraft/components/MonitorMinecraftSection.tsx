import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatSize } from '../format-size';
import type { IMinecraftMonitor, IMinecraftMonitorServer } from '../types.monitor';

const stateVariant = (state: IMinecraftMonitorServer['state']) =>
  state === 'running' ? 'default' : state === 'crashed' ? 'destructive' : 'secondary';

const ServerRow: React.FC<{ server: IMinecraftMonitorServer }> = ({ server }) => {
  const { t } = useTranslation('minecraft');
  const parts = [
    t('monitor.players', { current: server.players, max: server.maxPlayers }),
    server.cpu === null ? null : `${server.cpu.toFixed(1)} %`,
    server.memBytes === null ? null : formatSize(server.memBytes),
  ].filter(Boolean);
  return (
    <div className="flex flex-col gap-1 border-t border-border/50 py-2 first:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-caption font-medium">{server.name}</span>
        <Badge variant={stateVariant(server.state)}>{t(`state.${server.state}`)}</Badge>
      </div>
      <p className="text-caption text-muted-foreground">{parts.join(' · ')}</p>
      {server.state === 'crashed' && server.lastError && (
        <p className="truncate text-caption text-destructive">{server.lastError}</p>
      )}
    </div>
  );
};

/** Section "Minecraft" of the admin monitor ("App" tab), registered in `module.tsx`. */
export const MonitorMinecraftSection: React.FC<{ data: unknown }> = ({ data }) => {
  const { t } = useTranslation('minecraft');
  const minecraft = data as IMinecraftMonitor;
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-title font-bold">{t('monitor.title')}</h3>
          <p className="text-caption text-muted-foreground">
            {t('monitor.summary', {
              running: minecraft.running,
              total: minecraft.servers.length,
              players: minecraft.players,
              memory: formatSize(minecraft.memBytes),
              share: minecraft.memShare,
            })}
          </p>
        </div>
        {minecraft.servers.length === 0 ? (
          <p className="text-caption text-muted-foreground">{t('monitor.empty')}</p>
        ) : (
          <div className="flex flex-col">
            {minecraft.servers.map(server => (
              <ServerRow key={server.id} server={server} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
