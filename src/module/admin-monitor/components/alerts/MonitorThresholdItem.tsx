import {
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@ui/shad-cn/components/accordion.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorRule, MonitorMetric, MonitorUnit } from '../../types.alert';
import { MonitorThresholdField } from './MonitorThresholdField';

/** Max of the warn/crit fields, by unit (`%` is capped at 100, `ms` left generous). */
const MAX_BY_UNIT: Record<'%' | 'ms', number> = { '%': 100, ms: 60_000 };

/** One metric: summary in the header, switch + fields when opened. */
export const MonitorThresholdItem: React.FC<{
  metric: MonitorMetric;
  name: string;
  unit: MonitorUnit;
  rule: IMonitorRule;
  onChange: (patch: Partial<IMonitorRule>) => void;
}> = ({ metric, name, unit, rule, onChange }) => {
  const { t } = useTranslation('admin-monitor');
  const max = MAX_BY_UNIT[unit];
  return (
    <AccordionItem value={metric} className="border-border/50 px-4 last:border-b-0">
      <AccordionTrigger className="min-h-14 items-center py-3">
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-body font-bold">{name}</span>
          <span className="truncate text-caption font-normal text-muted-foreground">
            {rule.enabled
              ? t('thresholds.summary', {
                  warn: `${rule.warn}${unit}`,
                  crit: `${rule.crit}${unit}`,
                  minutes: rule.minutes,
                })
              : t('thresholds.off')}
          </span>
        </span>
      </AccordionTrigger>
      <AccordionPanel className="flex flex-col gap-3 text-foreground">
        <label className="flex min-h-11 items-center justify-between gap-3">
          <span className="text-body">{t('thresholds.enabled')}</span>
          <Switch checked={rule.enabled} onCheckedChange={enabled => onChange({ enabled })} />
        </label>
        <div className="flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-2">
          <MonitorThresholdField
            label={`${t('thresholds.warn')} (${unit})`}
            value={rule.warn}
            min={0}
            max={max}
            disabled={!rule.enabled}
            onChange={warn => onChange({ warn })}
          />
          <MonitorThresholdField
            label={`${t('thresholds.crit')} (${unit})`}
            value={rule.crit}
            min={0}
            max={max}
            disabled={!rule.enabled}
            onChange={crit => onChange({ crit })}
          />
          <MonitorThresholdField
            label={t('thresholds.minutes')}
            value={rule.minutes}
            min={0}
            max={60}
            disabled={!rule.enabled}
            onChange={minutes => onChange({ minutes })}
          />
        </div>
      </AccordionPanel>
    </AccordionItem>
  );
};
