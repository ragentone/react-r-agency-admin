import { Button } from '@ui/shad-cn/components/button.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorAlertEvent } from '../../types.alert';
import { clockShort } from '../../utils';
import { MonitorAlertRow } from './MonitorAlertRow';
import { MonitorAlertsSection } from './MonitorAlertsSection';

const SHORT = 8;

/** Alert log, newest first; shows the latest few, the rest on demand. */
export const MonitorAlertsLog: React.FC<{ log: IMonitorAlertEvent[] }> = ({ log }) => {
  const { t } = useTranslation('admin-monitor');
  const [expanded, setExpanded] = useState(false);
  const entries = [...log].reverse();
  const shown = expanded ? entries : entries.slice(0, SHORT);
  return (
    <MonitorAlertsSection title={t('alerts.logTitle')} text={t('alerts.logText')}>
      {entries.length === 0 ? (
        <p className="px-4 py-6 text-body text-muted-foreground">{t('alerts.logEmpty')}</p>
      ) : (
        <>
          <ul>
            {shown.map((entry, index) => (
              <MonitorAlertRow
                key={`${entry.t}-${entry.metric}-${index}`}
                metric={entry.metric}
                level={entry.level}
                value={entry.value}
                caption={clockShort(entry.t)}
              />
            ))}
          </ul>
          {entries.length > SHORT && (
            <Button
              variant="ghost"
              className="h-12 w-full rounded-none border-t border-border/50"
              onClick={() => setExpanded(open => !open)}
            >
              {t(expanded ? 'alerts.logLess' : 'alerts.logMore', { count: entries.length - SHORT })}
            </Button>
          )}
        </>
      )}
    </MonitorAlertsSection>
  );
};
