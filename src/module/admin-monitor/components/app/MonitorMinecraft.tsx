import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorMinecraft, IMonitorMinecraftServer } from '../../types.minecraft';
import { formatBytes } from '../../utils';

const stateVariant = (state: IMonitorMinecraftServer['state']) =>
  state === 'running' ? 'default' : state === 'crashed' ? 'destructive' : 'secondary';

const ServerRow: React.FC<{ server: IMonitorMinecraftServer }> = ({ server }) => {
  const { t } = useTranslation('admin-monitor');
  const parts = [
    t('minecraft.players', { current: server.players, max: server.maxPlayers }),
    server.cpu === null ? null : `${server.cpu.toFixed(1)} %`,
    server.memBytes === null ? null : formatBytes(server.memBytes),
  ].filter(Boolean);
  return (
    <div className="flex flex-col gap-1 border-t border-border/50 py-2 first:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-caption font-medium">{server.name}</span>
        <Badge variant={stateVariant(server.state)}>{t(`minecraft.state.${server.state}`)}</Badge>
      </div>
      <p className="text-caption text-muted-foreground">{parts.join(' · ')}</p>
      {server.state === 'crashed' && server.lastError && (
        <p className="truncate text-caption text-destructive">{server.lastError}</p>
      )}
    </div>
  );
};

/** Minecraft servers: state, players, CPU and memory per server (section of the "App" tab). */
export const MonitorMinecraft: React.FC<{ minecraft: IMonitorMinecraft }> = ({ minecraft }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-title font-bold">{t('minecraft.title')}</h3>
          <p className="text-caption text-muted-foreground">
            {t('minecraft.summary', {
              running: minecraft.running,
              total: minecraft.servers.length,
              players: minecraft.players,
              memory: formatBytes(minecraft.memBytes),
              share: minecraft.memShare,
            })}
          </p>
        </div>
        {minecraft.servers.length === 0 ? (
          <p className="text-caption text-muted-foreground">{t('minecraft.empty')}</p>
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
