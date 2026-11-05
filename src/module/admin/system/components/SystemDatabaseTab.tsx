import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { SystemApi } from '../api';
import { readLast, rememberLast } from '../last.loaded';
import type { IDbUsageReport } from '../types';
import { DatabaseUsageReport } from './DatabaseUsageReport';
import { SystemEntitiesTab } from './SystemEntitiesTab';

type DatabaseView = 'usage' | 'entities';
const VIEWS: DatabaseView[] = ['usage', 'entities'];
const USAGE_KEY = 'db-usage';

/** Tab "Datenbank": table usage (read-only) and the list of registered entities. */
export const SystemDatabaseTab: React.FC = () => {
  const { t } = useTranslation('admin');
  const [view, setView] = useState<DatabaseView>('usage');
  return (
    <Tabs value={view} onValueChange={value => setView(value as DatabaseView)}>
      <TabsList aria-label={t('system.database.viewsLabel')} className="mx-4 mt-4 w-auto">
        {VIEWS.map(item => (
          <TabsTrigger key={item} value={item} className="font-bold">
            {t(`system.database.views.${item}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="usage" className="mt-0">
        <UsageView />
      </TabsContent>
      <TabsContent value="entities" className="mt-0">
        <SystemEntitiesTab />
      </TabsContent>
    </Tabs>
  );
};

/** Table usage report. Shows the last result at once while it refreshes. */
const UsageView: React.FC = () => {
  const { data, loading, refreshing, error, reload } = useStatsQuery(
    () => SystemApi.dbUsage(),
    result => result.report,
    USAGE_KEY
  );
  useEffect(() => {
    if (data) rememberLast(USAGE_KEY, data);
  }, [data]);
  const shown = data ?? readLast<IDbUsageReport>(USAGE_KEY);
  if (!shown && loading) return <StatsSkeleton tiles={4} variant="list" />;
  if (!shown && error) return <StatsError onRetry={() => void reload()} />;
  if (!shown) return null;
  return (
    <DatabaseUsageReport
      report={shown}
      refreshing={refreshing || loading}
      onRefresh={() => void reload()}
    />
  );
};
