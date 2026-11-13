import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../../admin/home/components/HomeSection';
import { useMonitorApp } from '../../hooks/use-monitor';
import { MonitorCron } from './MonitorCron';
import { MonitorDb } from './MonitorDb';
import { MonitorGraphql } from './MonitorGraphql';
import { MonitorMesh } from './MonitorMesh';
import { MonitorPlugins } from './MonitorPlugins';
import { MonitorWs } from './MonitorWs';

/** Tab "App": WebSocket, GraphQL, cron, plugins, database, mesh. */
export const MonitorAppArea: React.FC = () => {
  const { t } = useTranslation('admin-monitor');
  const { data, loading, error, reload } = useMonitorApp();

  if (loading) return <Skeleton className="h-72 rounded-xl" />;
  if (error && !data) {
    return <HomeError text={t('error')} retry={t('retry')} onRetry={() => void reload()} />;
  }
  if (!data) return null;

  return (
    <div className="flex flex-col gap-4">
      <MonitorWs ws={data.ws} />
      <MonitorGraphql graphql={data.graphql} />
      <div className="grid gap-4 md:grid-cols-2">
        <MonitorCron cron={data.cron} />
        <MonitorPlugins plugins={data.plugins} />
      </div>
      <MonitorDb db={data.db} />
      <MonitorMesh mesh={data.mesh} />
    </div>
  );
};
