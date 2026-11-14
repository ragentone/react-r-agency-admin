import { Status, StatusIndicator } from '@ui/shad-cn/components/status.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

const VARIANT = { ok: 'success', warn: 'warning', crit: 'error' } as const;

/** One alert line: metric + caption left, value + level badge right. */
export const MonitorAlertRow: React.FC<{
  /** Name and unit of the metric (from the runtime, so modules can add their own). */
  name: string;
  unit: string;
  level: 'ok' | 'warn' | 'crit';
  value: number;
  caption: string;
}> = ({ name, unit, level, value, caption }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <li className="flex min-h-14 items-center justify-between gap-3 border-b border-border/50 px-4 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-body font-bold">{name}</p>
        <p className="truncate text-caption text-muted-foreground">{caption}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-body font-bold tabular-nums">
          {value}
          {unit}
        </span>
        <Status variant={VARIANT[level]}>
          <StatusIndicator />
          {t(`alerts.level.${level}`)}
        </Status>
      </div>
    </li>
  );
};
