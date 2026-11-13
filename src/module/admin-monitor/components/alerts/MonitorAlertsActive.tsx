import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Status, StatusIndicator } from '@ui/shad-cn/components/status.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { MONITOR_UNITS } from '../../types.alert';
import type { IMonitorAlert } from '../../types.alert';

/** Open alerts: metric, level and the value that triggered it. */
export const MonitorAlertsActive: React.FC<{ active: IMonitorAlert[] }> = ({ active }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-title font-bold">{t('alerts.activeTitle')}</h3>
          <p className="text-caption text-muted-foreground">{t('alerts.activeText')}</p>
        </div>
        {active.length === 0 ? (
          <p className="text-body text-muted-foreground">{t('alerts.activeEmpty')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/50">
            {active.map(alert => (
              <li
                key={alert.metric}
                className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span className="font-semibold">{t(`metric.${alert.metric}`)}</span>
                <span className="flex items-center gap-2">
                  <span className="tabular-nums text-caption text-muted-foreground">
                    {alert.value}
                    {MONITOR_UNITS[alert.metric]}
                  </span>
                  <Status variant={alert.level === 'crit' ? 'error' : 'warning'}>
                    <StatusIndicator />
                    {t(`alerts.level.${alert.level}`)}
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
