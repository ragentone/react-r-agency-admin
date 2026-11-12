import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatAgo } from '../../stats/utils';
import { SystemApi } from '../api';
import type { ISystemDeployHistory, ISystemRelease, ISystemVersion, SystemDeployApp } from '../types';
import { SystemDeploymentDialog } from './SystemDeploymentDialog';

const APPS: SystemDeployApp[] = ['frontend', 'admin', 'runtime'];

/** Frontend and admin line: live version and plan of the release line. */
const lineOf = (
  history: ISystemDeployHistory,
  app: SystemDeployApp
): { current: ISystemVersion | null; release: ISystemRelease } =>
  app === 'admin' ? history.admin : app === 'runtime' ? history.runtime : history;

/** Tab "Deployments": one row per release line (site, admin). Edit opens the plan. */
export const SystemDeploysTab: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const [editing, setEditing] = useState<SystemDeployApp | null>(null);
  const { data, loading, error, reload } = useStatsQuery(
    () => SystemApi.deploys(),
    result => result.history,
    'deploys'
  );
  if (loading) return <StatsSkeleton tiles={1} />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;

  return (
    <div className="px-4 pt-4 pb-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('system.deployments.columns.scope')}</TableHead>
            <TableHead>{t('system.deployments.columns.version')}</TableHead>
            <TableHead className="hidden sm:table-cell">
              {t('system.deployments.columns.last')}
            </TableHead>
            <TableHead className="text-right">
              <span className="sr-only">{t('system.deployments.columns.actions')}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {APPS.map(app => {
            const { current } = lineOf(data, app);
            return (
              <TableRow key={app}>
                <TableCell className="font-semibold">
                  {t(`system.deployments.scope.${app}`)}
                </TableCell>
                <TableCell className="font-mono tabular-nums">{current?.version ?? '–'}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {current ? formatAgo(current.finishedAt, locale) : '–'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full font-bold"
                    onClick={() => setEditing(app)}
                    aria-label={t('system.deployments.editAria', {
                      scope: t(`system.deployments.scope.${app}`),
                    })}
                  >
                    {t('system.deployments.edit')}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

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
