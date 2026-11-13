import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorHost } from '../../types';
import { formatDuration } from '../../utils';

/** Static facts about the machine and the Node process. */
export const MonitorHost: React.FC<{ host: IMonitorHost }> = ({ host }) => {
  const { t } = useTranslation('admin-monitor');
  const rows: [string, string][] = [
    [t('host.name'), host.hostname],
    [t('host.os'), `${host.platform} (${host.arch})`],
    [t('host.cpu'), `${host.cpuModel} · ${host.cpuCount}×`],
    [t('host.load'), host.load.join(' / ')],
    [t('host.uptime'), formatDuration(host.uptime)],
    [
      t('host.process'),
      `Node ${host.node} · PID ${host.pid} · ${formatDuration(host.processUptime)}`,
    ],
  ];
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col p-4">
        <h3 className="mb-2 text-title font-bold">{t('host.title')}</h3>
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-0.5 border-t border-border/50 py-2 sm:flex-row sm:justify-between sm:gap-4"
          >
            <span className="text-caption text-muted-foreground">{label}</span>
            <span className="min-w-0 break-words text-body sm:text-right">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
