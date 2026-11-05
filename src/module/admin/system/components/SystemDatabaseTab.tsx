import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { SystemApi } from '../api';
import { DatabaseUsageReport } from './DatabaseUsageReport';
import { SystemEntitiesTab } from './SystemEntitiesTab';

type DatabaseView = 'usage' | 'entities';
const VIEWS: DatabaseView[] = ['usage', 'entities'];

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

/** Table usage report, loaded when the view is shown. */
const UsageView: React.FC = () => {
  const { data, loading, refreshing, error, reload } = useStatsQuery(
    () => SystemApi.dbUsage(),
    result => result.report,
    'db-usage'
  );
  if (loading && !data) return <StatsSkeleton tiles={4} variant="list" />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  return (
    <DatabaseUsageReport report={data} refreshing={refreshing} onRefresh={() => void reload()} />
  );
};
