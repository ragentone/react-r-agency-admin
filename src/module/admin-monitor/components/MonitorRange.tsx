import { Tabs, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_MONITOR_RANGES } from '../const';

/** Time range switch (5 min / 15 min / 1 h). */
export const MonitorRange: React.FC<{ value: number; onChange: (minutes: number) => void }> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <Tabs value={String(value)} onValueChange={next => onChange(Number(next))}>
      <TabsList className="w-full sm:w-fit">
        {ADMIN_MONITOR_RANGES.map(minutes => (
          <TabsTrigger key={minutes} value={String(minutes)} className="flex-1 sm:flex-none">
            {t(`range.${minutes}`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
