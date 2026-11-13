import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorApp } from '../../types.app';
import { clockShort } from '../../utils';

/** Mesh / build info: version, node name, environment, started at. */
export const MonitorMesh: React.FC<{ mesh: IMonitorApp['mesh'] }> = ({ mesh }) => {
  const { t } = useTranslation('admin-monitor');
  const rows: [string, string][] = [
    [t('mesh.version'), mesh.version],
    [t('mesh.node'), mesh.node],
    [t('mesh.env'), mesh.env],
    [t('mesh.startedAt'), clockShort(mesh.startedAt)],
  ];
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <h3 className="text-title font-bold">{t('mesh.title')}</h3>
        <div className="flex flex-col">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between gap-4 border-t border-border/50 py-2 text-caption first:border-t-0"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
