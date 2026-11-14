import { CheckCircle2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorAlert } from '../../types.alert';
import { clockShort } from '../../utils';
import { MonitorAlertRow } from './MonitorAlertRow';
import { MonitorAlertsSection } from './MonitorAlertsSection';

/** Open alerts; a calm "all fine" state when nothing is violated. */
export const MonitorAlertsActive: React.FC<{ active: IMonitorAlert[] }> = ({ active }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <MonitorAlertsSection title={t('alerts.activeTitle')} text={t('alerts.activeText')}>
      {active.length === 0 ? (
        <div className="flex items-center gap-3 px-4 py-6">
          <CheckCircle2 className="size-6 shrink-0 text-green-600" aria-hidden />
          <p className="text-body font-bold">{t('alerts.activeEmpty')}</p>
        </div>
      ) : (
        <ul>
          {active.map(alert => (
            <MonitorAlertRow
              key={alert.metric}
              metric={alert.metric}
              level={alert.level}
              value={alert.value}
              caption={t('alerts.since', { time: clockShort(alert.since) })}
            />
          ))}
        </ul>
      )}
    </MonitorAlertsSection>
  );
};
