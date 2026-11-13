import { Tabs, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_MONITOR_HISTORY_RANGES } from '../../const';

/** Long-term range switch (24 h / 3 d / 7 d). */
export const MonitorHistoryRange: React.FC<{
  value: number;
  onChange: (hours: number) => void;
}> = ({ value, onChange }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <Tabs value={String(value)} onValueChange={next => onChange(Number(next))}>
      <TabsList className="w-full sm:w-fit">
        {ADMIN_MONITOR_HISTORY_RANGES.map(hours => (
          <TabsTrigger key={hours} value={String(hours)} className="flex-1 sm:flex-none">
            {t(`historyRange.${hours}`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
