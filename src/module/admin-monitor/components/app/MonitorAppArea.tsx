import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../../admin/home/components/HomeSection';
import { useMonitorApp } from '../../hooks/use-monitor';
import { getMonitorSection } from '../../registry';
import { MonitorDb } from './MonitorDb';
import { MonitorGraphql } from './MonitorGraphql';
import { MonitorMesh } from './MonitorMesh';
import { MonitorWs } from './MonitorWs';

/** Tab "App": WebSocket, GraphQL, database, mesh. */
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
      <MonitorDb db={data.db} />
      {Object.entries(data.modules ?? {}).map(([id, section]) => {
        const Section = getMonitorSection(id);
        return Section ? (
          <Suspense key={id} fallback={<Skeleton className="h-40 rounded-xl" />}>
            <Section data={section} />
          </Suspense>
        ) : null;
      })}
      <MonitorMesh mesh={data.mesh} />
    </div>
  );
};
