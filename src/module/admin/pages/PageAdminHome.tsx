import { PageIndex } from '@core/pages/default/PageIndex.tsx';
import { PluginSlot } from '@core/plugin';
import { RoutePage } from '@router/components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HomeAttention } from '../home/components/HomeAttention';
import { HomeKpis } from '../home/components/HomeKpis';
import { HomeLive } from '../home/components/HomeLive';
import { HomeNewUsers } from '../home/components/HomeNewUsers';
import { HomeSystem } from '../home/components/HomeSystem';
import { HomeUserSearch } from '../home/components/HomeUserSearch';
import { useAdminAccess } from '../hooks';
import { StatsUserDrawer } from '../stats/components/StatsUserDrawer';
import { useStatsQuery } from '../stats/hooks/use.stats.query';
import { SystemApi } from '../system/api';
import { ADMIN_SCROLL, ADMIN_WIDTH, AdminHeading, AdminPage } from '../ui/AdminPage';

/**
 * Start page of the admin instance. Admins get a dashboard (mobile first: one column, from `lg`
 * a main column with the key figures and a side column with live + system); everybody else
 * sees the normal core start page.
 */
export const PageAdminHome: React.FC = () => {
  const admin = useAdminAccess();
  if (!admin) return <PageIndex />;
  return (
    <RoutePage width={ADMIN_WIDTH.wide} scrollable={true} classes={{ scroll: ADMIN_SCROLL }}>
      <AdminHome />
    </RoutePage>
  );
};

const AdminHome: React.FC = () => {
  const { t } = useTranslation('admin');
  const [userId, setUserId] = useState<string | null>(null);
  // Used by "needs attention" and "system" – loaded once.
  const deploys = useStatsQuery(
    () => SystemApi.deploys(),
    result => result.history,
    'home-deploys',
    60_000
  );
  const storage = useStatsQuery(
    () => SystemApi.storage(false),
    result => result.storage,
    'home-storage'
  );

  return (
    <AdminPage slot="admin-home">
      <AdminHeading
        title={t('home.title')}
        description={t('home.subtitle')}
        actions={<HomeUserSearch onUser={setUserId} />}
      />
      <PluginSlot name="home.widget" scope="admin" />
      <HomeAttention deploys={deploys} storage={storage} />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 md:gap-6 lg:col-span-2">
          <HomeKpis />
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          <HomeLive />
          <HomeSystem deploys={deploys} storage={storage} />
        </div>
      </div>

      <HomeNewUsers onUser={setUserId} />
      <StatsUserDrawer userId={userId} onClose={() => setUserId(null)} />
    </AdminPage>
  );
};
