import { Accordion } from '@ui/shad-cn/components/accordion.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMonitorApi } from '../../api';
import type { IMonitorRule, IMonitorThresholds, MonitorMetric } from '../../types.alert';
import { MONITOR_METRICS } from '../../types.alert';
import { MonitorAlertsSection } from './MonitorAlertsSection';
import { MonitorThresholdItem } from './MonitorThresholdItem';

/** Editable thresholds per metric (accordion); save bar sticks to the bottom when dirty. */
export const MonitorThresholds: React.FC<{
  thresholds: IMonitorThresholds;
  onSaved: (thresholds: IMonitorThresholds) => void;
}> = ({ thresholds, onSaved }) => {
  const { t } = useTranslation('admin-monitor');
  const [draft, setDraft] = useState(thresholds);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(thresholds);

  const set = (metric: MonitorMetric, patch: Partial<IMonitorRule>) =>
    setDraft(previous => ({ ...previous, [metric]: { ...previous[metric], ...patch } }));

  const save = async () => {
    setSaving(true);
    const result = await AdminMonitorApi.saveThresholds(draft);
    setSaving(false);
    if (result.success && result.thresholds) {
      onSaved(result.thresholds);
      toast.success(t('thresholds.saved'));
    } else {
      toast.error(t('thresholds.error'));
    }
  };

  return (
    <MonitorAlertsSection title={t('thresholds.title')} text={t('thresholds.text')}>
      <Accordion>
        {MONITOR_METRICS.map(metric => (
          <MonitorThresholdItem
            key={metric}
            metric={metric}
            rule={draft[metric]}
            onChange={patch => set(metric, patch)}
          />
        ))}
      </Accordion>
      {dirty && (
        <div className="sticky bottom-0 border-t border-border/50 bg-background/95 p-3 backdrop-blur">
          <Button
            className="h-11 w-full"
            disabled={saving}
            isLoading={saving}
            onClick={() => void save()}
          >
            {t('thresholds.save')}
          </Button>
        </div>
      )}
    </MonitorAlertsSection>
  );
};
