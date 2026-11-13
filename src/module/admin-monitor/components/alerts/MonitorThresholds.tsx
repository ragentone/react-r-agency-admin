import { Button } from '@ui/shad-cn/components/button.tsx';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMonitorApi } from '../../api';
import { MONITOR_METRICS, MONITOR_UNITS } from '../../types.alert';
import type { IMonitorRule, IMonitorThresholds } from '../../types.alert';

/** Editable warn/crit thresholds and the minutes they must hold, per metric. */
export const MonitorThresholds: React.FC<{
  thresholds: IMonitorThresholds;
  onSaved: (thresholds: IMonitorThresholds) => void;
}> = ({ thresholds, onSaved }) => {
  const { t } = useTranslation('admin-monitor');
  const [draft, setDraft] = useState(thresholds);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(thresholds);

  const set = (metric: keyof IMonitorThresholds, patch: Partial<IMonitorRule>) =>
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
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-title font-bold">{t('thresholds.title')}</h3>
            <p className="text-caption text-muted-foreground">{t('thresholds.text')}</p>
          </div>
          <Button size="sm" disabled={!dirty || saving} isLoading={saving} onClick={() => void save()}>
            {t('thresholds.save')}
          </Button>
        </div>
        <ul className="flex flex-col divide-y divide-border/50">
          {MONITOR_METRICS.map(metric => {
            const rule = draft[metric];
            const unit = MONITOR_UNITS[metric];
            return (
              <li key={metric} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold">{t(`metric.${metric}`)}</span>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={checked => set(metric, { enabled: checked })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-micro text-muted-foreground">
                      {t('thresholds.warn')} ({unit})
                    </span>
                    <Input
                      type="number"
                      size="sm"
                      value={rule.warn}
                      disabled={!rule.enabled}
                      onChange={e => set(metric, { warn: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-micro text-muted-foreground">
                      {t('thresholds.crit')} ({unit})
                    </span>
                    <Input
                      type="number"
                      size="sm"
                      value={rule.crit}
                      disabled={!rule.enabled}
                      onChange={e => set(metric, { crit: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-micro text-muted-foreground">
                      {t('thresholds.minutes')}
                    </span>
                    <Input
                      type="number"
                      size="sm"
                      min={0}
                      value={rule.minutes}
                      disabled={!rule.enabled}
                      onChange={e => set(metric, { minutes: Number(e.target.value) })}
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
