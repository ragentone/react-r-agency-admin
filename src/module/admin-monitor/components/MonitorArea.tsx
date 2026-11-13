import { Tabs, TabsContent } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPage } from '../../admin/ui/AdminPage';
import { AdminTabsBar } from '../../admin/ui/AdminTabsBar';
import { MonitorAlertsArea } from './alerts/MonitorAlertsArea';
import { MonitorAppArea } from './app/MonitorAppArea';
import { MonitorHistoryArea } from './history/MonitorHistoryArea';
import { MonitorSystemArea } from './system/MonitorSystemArea';

const TABS = ['system', 'app', 'alerts', 'history'] as const;

/** Composes the monitor page: tabs "System | App | Alerts | History". */
export const MonitorArea: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  const [tab, setTab] = useState<string>(TABS[0]);

  return (
    <AdminPage>
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-4">
        <AdminTabsBar
          label={t('title')}
          tabs={TABS.map(value => ({ value, label: t(`tabs.${value}`) }))}
        />
        {TABS.map(value => (
          <TabsContent key={value} value={value} className="mt-0">
            {value === 'system' && <MonitorSystemArea />}
            {value === 'app' && <MonitorAppArea />}
            {value === 'alerts' && <MonitorAlertsArea />}
            {value === 'history' && <MonitorHistoryArea />}
          </TabsContent>
        ))}
      </Tabs>
    </AdminPage>
  );
};
