import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Status, StatusIndicator } from '@ui/shad-cn/components/status.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MONITOR_UNITS } from '../../types.alert';
import type { IMonitorAlertEvent } from '../../types.alert';
import { clockShort } from '../../utils';

const VARIANT = { ok: 'success', warn: 'warning', crit: 'error' } as const;

/** Alert log: newest changes first (open / resolved), newest entries on top. */
export const MonitorAlertsLog: React.FC<{ log: IMonitorAlertEvent[] }> = ({ log }) => {
  const { t } = useTranslation('admin-monitor');
  const entries = [...log].reverse();
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-title font-bold">{t('alerts.logTitle')}</h3>
          <p className="text-caption text-muted-foreground">{t('alerts.logText')}</p>
        </div>
        {entries.length === 0 ? (
          <p className="text-body text-muted-foreground">{t('alerts.logEmpty')}</p>
        ) : (
          <ul className="flex max-h-80 flex-col divide-y divide-border/50 overflow-y-auto">
            {entries.map((entry, index) => (
              <li
                key={`${entry.t}-${entry.metric}-${index}`}
                className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold">{t(`metric.${entry.metric}`)}</span>
                  <span className="text-micro text-muted-foreground">{clockShort(entry.t)}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-caption text-muted-foreground">
                    {entry.value}
                    {MONITOR_UNITS[entry.metric]}
                  </span>
                  <Status variant={VARIANT[entry.level]}>
                    <StatusIndicator />
                    {t(`alerts.level.${entry.level}`)}
                  </Status>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
