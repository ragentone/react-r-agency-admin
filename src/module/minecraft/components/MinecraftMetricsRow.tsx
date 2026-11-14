import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMinecraftMetrics } from '../types';

export const formatMemory = (bytes: number): string =>
  bytes >= 1e9 ? `${(bytes / 1e9).toFixed(2)} GB` : `${Math.round(bytes / 1e6)} MB`;

/** CPU und RAM des Servers (Messung alle 10 s); ohne Messwert nur "–". */
export const MinecraftMetricsRow: React.FC<{ metrics: IMinecraftMetrics | null | undefined }> = ({
  metrics,
}) => {
  const { t } = useTranslation('minecraft');
  return (
    <div className="flex justify-between gap-4 border-t border-border/50 py-2 text-caption">
      <span className="text-muted-foreground">{t('card.resources')}</span>
      <span className="tabular-nums">
        {metrics ? `${metrics.cpu.toFixed(1)} % · ${formatMemory(metrics.memBytes)}` : '–'}
      </span>
    </div>
  );
};
