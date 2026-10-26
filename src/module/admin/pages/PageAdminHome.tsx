import { UserGreeting } from '@core/auth';
import { PageIndex } from '@core/pages/default/PageIndex.tsx';
import { RoutePage } from '@router/components';
import React, { useState } from 'react';

import { HomeAttention } from '../home/components/HomeAttention';
import { HomeKpis } from '../home/components/HomeKpis';
import { HomeLive } from '../home/components/HomeLive';
import { HomeMembers } from '../home/components/HomeMembers';
import { HomeSystem } from '../home/components/HomeSystem';
import { HomeUserSearch } from '../home/components/HomeUserSearch';
import { useAdminAccess } from '../hooks';
import { StatsUserDrawer } from '../stats/components/StatsUserDrawer';
import { useStatsQuery } from '../stats/hooks/use.stats.query';
import { SystemApi } from '../system/api';

/**
 * Start page of the admin instance. Admins get a dashboard (mobile first, one column, from
 * `md` two columns at the bottom); everybody else sees the normal core start page.
 */
export const PageAdminHome: React.FC = () => {
  const admin = useAdminAccess();
  if (!admin) return <PageIndex />;
  return (
    <RoutePage width={900} scrollable={true} classes={{ scroll: 'p-0' }}>
      <AdminHome />
    </RoutePage>
  );
};

const AdminHome: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  // Used by "needs attention" and "system" – loaded once.
  const deploys = useStatsQuery(
    () => SystemApi.deploys(5),
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
    <div data-slot="admin-home" className="flex min-h-dvh w-full flex-col bg-background pb-10">
      <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-4">
        <UserGreeting />
        <HomeUserSearch onUser={setUserId} />
      </div>

      <HomeAttention deploys={deploys} storage={storage} onUser={setUserId} />

      <div className="border-t border-border/50 px-4 py-4">
        <HomeLive />
      </div>

      <div className="border-t border-border/50">
        <HomeKpis />
      </div>

      <div className="grid border-t border-border/50 md:grid-cols-2 md:divide-x md:divide-border/50">
        <HomeMembers onUser={setUserId} />
        <HomeSystem
          deploys={deploys}
          storage={storage}
          className="border-t border-border/50 md:border-t-0"
        />
      </div>

      <StatsUserDrawer userId={userId} onClose={() => setUserId(null)} />
    </div>
  );
};
