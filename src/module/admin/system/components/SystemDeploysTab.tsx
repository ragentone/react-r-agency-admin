import { ChartSection, StatTile } from '@ui/patterns/chart';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Rocket } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatsEmpty, StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatAgo } from '../../stats/utils';
import { SystemApi } from '../api';
import type { ISystemDeployHistory } from '../types';
import { SystemReleasePlan } from './SystemReleasePlan';

/** Tab "Version": the one live build (version, what is new) and the plan of the next build. */
export const SystemDeploysTab: React.FC = () => {
  const { data, loading, error, reload } = useStatsQuery(
    () => SystemApi.deploys(),
    result => result.history,
    'deploys'
  );
  if (loading) return <StatsSkeleton tiles={1} />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  return <Version history={data} onChanged={() => void reload()} />;
};

const Version: React.FC<{ history: ISystemDeployHistory; onChanged: () => void }> = ({
  history,
  onChanged,
}) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const current = history.current;
  const plan = <SystemReleasePlan release={history.release} onSaved={onChanged} />;

  if (!current) {
    return (
      <>
        {plan}
        <StatsEmpty
          icon={<Rocket />}
          title={t('system.deploys.emptyTitle')}
          text={t('system.deploys.emptyText')}
        />
      </>
    );
  }

  return (
    <>
      <div className="px-4 pt-4 pb-4">
        <StatTile
          icon={<Rocket />}
          label={t('system.deploys.last')}
          value={current.version ? t('system.deploys.version', { version: current.version }) : '–'}
          hint={t('system.deploys.liveSince', { ago: formatAgo(current.finishedAt, locale) })}
        />
      </div>

      {(current.notes.length > 0 || current.required) && (
        <ChartSection title={t('system.deploys.next.notes')}>
          {current.required && (
            <Badge variant="outline" className="mb-2 rounded-full border-foreground">
              {t('system.deploys.requiredBadge')}
            </Badge>
          )}
          <ul className="flex flex-col gap-1 pb-2 text-body">
            {current.notes.map(note => (
              <li key={note} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span className="min-w-0">{note}</span>
              </li>
            ))}
          </ul>
        </ChartSection>
      )}

      {plan}
    </>
  );
};
