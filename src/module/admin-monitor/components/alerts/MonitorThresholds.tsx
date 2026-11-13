import { Button } from '@ui/shad-cn/components/button.tsx';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import {
  NumberInput,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputInput,
} from '@ui/shad-cn/components/number-input.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminMonitorApi } from '../../api';
import type { IMonitorRule, IMonitorThresholds, MonitorMetric } from '../../types.alert';
import { MONITOR_METRICS, MONITOR_UNITS } from '../../types.alert';

/** Max of the warn/crit fields, by unit (`%` is capped at 100, `ms` left generous). */
const MAX_BY_UNIT: Record<'%' | 'ms', number> = { '%': 100, ms: 60_000 };

/** One warn/crit/minutes number field. */
const ThresholdField: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, disabled, onChange }) => (
  <label className="flex flex-col gap-1">
    <span className="text-micro text-muted-foreground">{label}</span>
    <NumberInput
      value={String(value)}
      min={min}
      max={max}
      disabled={disabled}
      onValueChange={details => onChange(details.valueAsNumber)}
    >
      <NumberInputGroup>
        <NumberInputDecrement />
        <NumberInputInput size="sm" />
        <NumberInputIncrement />
      </NumberInputGroup>
    </NumberInput>
  </label>
);

/** Editable warn/crit thresholds and the minutes they must hold, per metric. */
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
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-title font-bold">{t('thresholds.title')}</h3>
            <p className="text-caption text-muted-foreground">{t('thresholds.text')}</p>
          </div>
          <Button
            size="sm"
            disabled={!dirty || saving}
            isLoading={saving}
            onClick={() => void save()}
          >
            {t('thresholds.save')}
          </Button>
        </div>
        <ul className="flex flex-col divide-y divide-border/50">
          {MONITOR_METRICS.map(metric => {
            const rule = draft[metric];
            const unit = MONITOR_UNITS[metric];
            const max = MAX_BY_UNIT[unit];
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
                  <ThresholdField
                    label={`${t('thresholds.warn')} (${unit})`}
                    value={rule.warn}
                    min={0}
                    max={max}
                    disabled={!rule.enabled}
                    onChange={value => set(metric, { warn: value })}
                  />
                  <ThresholdField
                    label={`${t('thresholds.crit')} (${unit})`}
                    value={rule.crit}
                    min={0}
                    max={max}
                    disabled={!rule.enabled}
                    onChange={value => set(metric, { crit: value })}
                  />
                  <ThresholdField
                    label={t('thresholds.minutes')}
                    value={rule.minutes}
                    min={0}
                    max={60}
                    disabled={!rule.enabled}
                    onChange={value => set(metric, { minutes: value })}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
