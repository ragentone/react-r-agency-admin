import { Button } from '@ui/shad-cn/components/button.tsx';
import { Card, CardContent, CardFooter } from '@ui/shad-cn/components/card.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatAgo } from '../../stats/utils';
import { SystemApi } from '../api';
import type {
  ISystemDeployHistory,
  ISystemRelease,
  ISystemVersion,
  SystemDeployApp,
} from '../types';
import { SystemBuildLog } from './SystemBuildLog';
import { SystemDeployConfirm } from './SystemDeployConfirm';
import { SystemDeploymentDialog } from './SystemDeploymentDialog';

const APPS: SystemDeployApp[] = ['frontend', 'admin', 'runtime'];

/** Live-only deploy button of a line; the server says whether it may deploy. */
const deployOf = (history: ISystemDeployHistory, app: SystemDeployApp) => {
  // The runtime restarts the server, so it waits while a frontend or admin build runs.
  const buildRunning = history.frontendRunning === true || history.adminRunning === true;
  if (app === 'runtime' && history.runtimeDeployable) {
    return {
      kind: 'runtime' as const,
      running: history.runtimeRunning === true,
      blocked: buildRunning,
      start: SystemApi.runtimeDeploy,
    };
  }
  if (app === 'frontend' && history.frontendDeployable) {
    return {
      kind: 'frontend' as const,
      running: history.frontendRunning === true,
      blocked: false,
      start: () => SystemApi.buildDeploy('frontend'),
    };
  }
  if (app === 'admin' && history.adminDeployable) {
    return {
      kind: 'admin' as const,
      running: history.adminRunning === true,
      blocked: false,
      start: () => SystemApi.buildDeploy('admin'),
    };
  }
  return null;
};

/** Frontend, admin and runtime line: live version and plan of the release line. */
const lineOf = (
  history: ISystemDeployHistory,
  app: SystemDeployApp
): { current: ISystemVersion | null; release: ISystemRelease } =>
  app === 'admin' ? history.admin : app === 'runtime' ? history.runtime : history;

/** Tab "Deployments": one item per release line with version, last deployment and actions. */
export const SystemDeploysTab: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const [editing, setEditing] = useState<SystemDeployApp | null>(null);
  const [logging, setLogging] = useState<'frontend' | 'admin' | null>(null);
  const [deploying, setDeploying] = useState<SystemDeployApp | null>(null);
  const { data, loading, error, reload } = useStatsQuery(
    () => SystemApi.deploys(),
    result => result.history,
    'deploys',
    // Versions, running builds and deployable flags change without a click: live while the tab is visible.
    3_000
  );
  if (loading) return <StatsSkeleton tiles={1} />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  const deployTarget = deploying ? deployOf(data, deploying) : null;

  return (
    <div className="px-4 pt-4 pb-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {APPS.map(app => {
          const { current } = lineOf(data, app);
          const deploy = deployOf(data, app);
          const scope = t(`system.deployments.scope.${app}`);
          return (
            <Card key={app} className="rounded-2xl border-border/50 shadow-none">
              <CardContent className="flex flex-col gap-1 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-body font-bold">{scope}</p>
                  <p className="font-mono text-sm tabular-nums">{current?.version ?? '–'}</p>
                  {current && (
                    <p className="text-sm text-muted-foreground">
                      {formatAgo(current.finishedAt, locale)}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 border-t border-border/50 p-3">
                {deploy && (
                  <Button
                    size="md"
                    className="w-full"
                    disabled={deploy.running || deploy.blocked}
                    onClick={() => setDeploying(app)}
                  >
                    {deploy.running
                      ? t('system.deployments.deploy.running')
                      : t(`system.deployments.deploy.${deploy.kind}.button`)}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => setLogging(app === 'runtime' ? null : app)}
                  disabled={app === 'runtime'}
                >
                  {t('system.deployments.log.button')}
                </Button>
                <Button
                  variant="default"
                  size="md"
                  className="w-full"
                  onClick={() => setEditing(app)}
                >
                  {t('system.deployments.edit')}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {deploying && deployTarget && (
        <SystemDeployConfirm
          kind={deployTarget.kind}
          start={deployTarget.start}
          onStarted={() => void reload()}
          onClose={() => setDeploying(null)}
        />
      )}

      {logging && (
        <SystemBuildLog
          app={logging}
          scope={t(`system.deployments.scope.${logging}`)}
          onClose={() => setLogging(null)}
        />
      )}

      {editing && (
        <SystemDeploymentDialog
          app={editing}
          release={lineOf(data, editing).release}
          onClose={() => setEditing(null)}
          onSaved={() => void reload()}
        />
      )}
    </div>
  );
};
