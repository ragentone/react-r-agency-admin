import { Tabs, TabsContent } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_SYSTEM_VIEW_KEY } from '../../const';
import { AdminPage } from '../../ui/AdminPage';
import { AdminPanel } from '../../ui/AdminPanel';
import { AdminTabsBar } from '../../ui/AdminTabsBar';
import type { SystemTab } from '../types';
import { SystemDatabaseTab } from './SystemDatabaseTab';
import { SystemDeploysTab } from './SystemDeploysTab';
import { SystemStorageTab } from './SystemStorageTab';

const TABS: SystemTab[] = ['deployments', 'storage', 'database'];
const STORE_KEY = ADMIN_SYSTEM_VIEW_KEY;

const restore = (): SystemTab => {
  try {
    const value = localStorage.getItem(STORE_KEY) as SystemTab | null;
    return value && TABS.includes(value) ? value : 'deployments';
  } catch {
    return 'deployments';
  }
};

/** `/admin/system`: deployments, server storage, database. */
export const SystemArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const [tab, setTab] = useState(restore);
  const change = (next: string) => {
    setTab(next as SystemTab);
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      // per-device convenience only
    }
  };

  return (
    <AdminPage slot="admin-system">
      <Tabs value={tab} onValueChange={change} className="flex flex-col gap-4">
        <AdminTabsBar
          label={t('system.tabsLabel')}
          tabs={TABS.map(item => ({ value: item, label: t(`system.tabs.${item}`) }))}
        />
        <AdminPanel flush={true}>
          <TabsContent value="deployments" className="mt-0 pb-4">
            <SystemDeploysTab />
          </TabsContent>
          <TabsContent value="storage" className="mt-0 pb-4">
            <SystemStorageTab />
          </TabsContent>
          <TabsContent value="database" className="mt-0 pb-4">
            <SystemDatabaseTab />
          </TabsContent>
        </AdminPanel>
      </Tabs>
    </AdminPage>
  );
};
