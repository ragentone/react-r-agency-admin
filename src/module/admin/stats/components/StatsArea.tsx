import { cn } from '@ui/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_STATS_VIEW_KEY } from '../../const';
import type { StatsRange, StatsTab } from '../types';
import { StatsRangeToggle } from './common';
import { StatsGrowthTab } from './StatsGrowthTab';
import { StatsLiveTab } from './StatsLiveTab';
import { StatsOverviewTab } from './StatsOverviewTab';
import { StatsSecurityTab } from './StatsSecurityTab';
import { StatsUserDrawer } from './StatsUserDrawer';
import { StatsVisitorsTab } from './StatsVisitorsTab';

const TABS: StatsTab[] = ['live', 'visitors', 'overview', 'growth', 'security'];
const STORE_KEY = ADMIN_STATS_VIEW_KEY;

const restore = (): { tab: StatsTab; range: StatsRange } => {
  try {
    const value = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    return {
      tab: TABS.includes(value.tab) ? value.tab : 'live',
      range: [1, 7, 30, 365].includes(value.range) ? value.range : 7,
    };
  } catch {
    return { tab: 'live', range: 7 };
  }
};

/** `/admin/stats`: who visits the site – live, visitors, statistics, growth, security. */
export const StatsArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const [state, setState] = useState(restore);
  const [userId, setUserId] = useState<string | null>(null);
  const update = (next: Partial<typeof state>) =>
    setState(previous => {
      const value = { ...previous, ...next };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(value));
      } catch {
        // per-device convenience only
      }
      return value;
    });

  return (
    <div data-slot="admin-stats" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="px-4 pt-3 pb-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {t('stats.title')}
        </h1>
        <p className="text-caption text-muted-foreground">{t('stats.subtitle')}</p>
        {state.tab !== 'live' && (
          <div className="mt-3">
            <StatsRangeToggle value={state.range} onChange={range => update({ range })} />
          </div>
        )}
      </header>

      <Tabs
        value={state.tab}
        onValueChange={tab => update({ tab: tab as StatsTab })}
        className="flex flex-1 flex-col"
      >
        <TabsList
          aria-label={t('stats.tabsLabel')}
          className="sticky top-0 z-10 flex h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border/50 bg-background/90 p-0 text-muted-foreground backdrop-blur [scrollbar-width:none]"
        >
          {TABS.map(tab => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(
                'relative min-h-12 flex-1 shrink-0 rounded-none px-4 text-body font-semibold shadow-none',
                'data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground data-[state=active]:shadow-none',
                'after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-12 after:-translate-x-1/2 after:rounded-full after:bg-foreground after:opacity-0 data-[state=active]:after:opacity-100'
              )}
            >
              {t(`stats.tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="live" className="mt-0 pb-10">
          <StatsLiveTab onUser={setUserId} />
        </TabsContent>
        <TabsContent value="visitors" className="mt-0 pb-10">
          <StatsVisitorsTab range={state.range} onUser={setUserId} />
        </TabsContent>
        <TabsContent value="overview" className="mt-0 pb-10">
          <StatsOverviewTab range={state.range} />
        </TabsContent>
        <TabsContent value="growth" className="mt-0 pb-10">
          <StatsGrowthTab range={state.range} onUser={setUserId} />
        </TabsContent>
        <TabsContent value="security" className="mt-0 pb-10">
          <StatsSecurityTab range={state.range} />
        </TabsContent>
      </Tabs>

      <StatsUserDrawer userId={userId} onClose={() => setUserId(null)} />
    </div>
  );
};
