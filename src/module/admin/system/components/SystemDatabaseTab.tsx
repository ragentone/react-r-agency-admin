import React from 'react';

import { StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { SystemApi } from '../api';
import { DatabaseUsageReport } from './DatabaseUsageReport';

/** Tab "Datenbank": which tables the code still uses. Read-only, nothing is deleted here. */
export const SystemDatabaseTab: React.FC = () => {
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
