import { cn } from '@ui/lib/utils';
import { ChartSection, StatTile } from '@ui/patterns/chart';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { Check, Clock, Rocket, Timer, TriangleAlert } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { StatsEmpty, StatsError, StatsSkeleton } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatAgo, formatDuration } from '../../stats/utils';
import { SystemApi } from '../api';
import type { ISystemDeploy, ISystemDeployHistory } from '../types';
import { SystemReleasePlan } from './SystemReleasePlan';

/** While a build runs the list refreshes on its own (visible page only). */
const POLL_MS = 15_000;

/** Tab "Deploys": production frontend builds – when, how long, how many devices were told. */
export const SystemDeploysTab: React.FC = () => {
  const { data, loading, error, reload } = useStatsQuery(
    () => SystemApi.deploys(50),
    result => result.history,
    'deploys',
    POLL_MS
  );
  if (loading) return <StatsSkeleton tiles={3} variant="list" />;
  if (error && !data) return <StatsError onRetry={() => void reload()} />;
  if (!data) return null;
  return <Deploys history={data} onChanged={() => void reload()} />;
};

const Deploys: React.FC<{ history: ISystemDeployHistory; onChanged: () => void }> = ({
  history,
  onChanged,
}) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const last = history.deploys.find(deploy => deploy.status === 'done');
  const stuck = history.deploys.filter(deploy => deploy.status === 'stuck').length;

  const plan = history.release && (
    <SystemReleasePlan release={history.release} onSaved={onChanged} />
  );

  if (!history.deploys.length) {
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
      <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-4">
        <StatTile
          icon={<Rocket />}
          label={t('system.deploys.last')}
          value={
            history.release?.current
              ? t('system.deploys.version', { version: history.release.current })
              : '–'
          }
          hint={
            last
              ? t('system.deploys.liveSince', {
                  ago: formatAgo(last.finishedAt ?? last.startedAt, locale),
                })
              : undefined
          }
        />
        <StatTile
          icon={<Timer />}
          label={t('system.deploys.median')}
          value={history.medianMs === null ? '–' : formatDuration(history.medianMs / 1000)}
        />
        <StatTile
          icon={stuck ? <TriangleAlert /> : <Clock />}
          label={stuck ? t('system.deploys.stuck') : t('system.deploys.running')}
          value={stuck || history.running}
        />
      </div>

      {plan}

      <ChartSection title={t('system.deploys.listTitle')} text={t('system.deploys.listText')}>
        <ItemGroup className="gap-0">
          {history.deploys.map(deploy => (
            <DeployRow key={deploy.id} deploy={deploy} locale={locale} />
          ))}
        </ItemGroup>
      </ChartSection>
    </>
  );
};

const STATUS_ICON = { done: Check, running: Clock, stuck: TriangleAlert } as const;

const DeployRow: React.FC<{ deploy: ISystemDeploy; locale: string }> = ({ deploy, locale }) => {
  const { t } = useTranslation('admin');
  const Icon = STATUS_ICON[deploy.status];
  const build = (deploy.buildId ?? deploy.deploymentId).slice(0, 9);
  const title = deploy.version
    ? t('system.deploys.version', { version: deploy.version })
    : t('system.deploys.build', { build });
  const planned = deploy.status !== 'done' && Boolean(deploy.version);

  const details =
    deploy.status === 'done'
      ? [
          formatAgo(deploy.finishedAt ?? deploy.startedAt, locale),
          deploy.durationMs === null ? null : formatDuration(deploy.durationMs / 1000),
          deploy.clients === null
            ? t('system.deploys.noBroadcast')
            : t('system.deploys.clients', { count: deploy.clients }),
        ]
      : [t('system.deploys.started', { ago: formatAgo(deploy.startedAt, locale) })];

  return (
    <Item className="rounded-none border-b border-border/50 px-0 py-3 last:border-b-0">
      <ItemMedia>
        <span
          aria-hidden="true"
          className={cn(
            'flex size-10 items-center justify-center rounded-full [&>svg]:size-5',
            deploy.status === 'done'
              ? 'bg-foreground text-background'
              : 'border-2 border-foreground text-foreground',
            deploy.status === 'stuck' && 'border-dashed'
          )}
        >
          <Icon className={cn(deploy.status === 'running' && 'motion-safe:animate-pulse')} />
        </span>
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="flex w-full items-center gap-2">
          <span className="truncate font-mono text-body font-bold tabular-nums">{title}</span>
          {planned && (
            <span className="shrink-0 text-caption text-muted-foreground">
              {t('system.deploys.planned')}
            </span>
          )}
          {deploy.bump && deploy.bump !== 'patch' && (
            <Badge variant="outline" className="shrink-0 rounded-full">
              {t(`system.deploys.bump.${deploy.bump}`)}
            </Badge>
          )}
          {deploy.required && (
            <Badge variant="outline" className="shrink-0 rounded-full border-foreground">
              {t('system.deploys.requiredBadge')}
            </Badge>
          )}
          <Badge
            variant={deploy.status === 'done' ? 'secondary' : 'outline'}
            className="ml-auto shrink-0 rounded-full"
          >
            {t(`system.deploys.status.${deploy.status}`)}
          </Badge>
        </ItemTitle>
        <ItemDescription className="text-caption">
          {details.filter(Boolean).join(' · ')}
        </ItemDescription>
        {deploy.notes.length > 0 && (
          <ul className="mt-1 flex flex-col gap-0.5 text-caption text-foreground">
            {deploy.notes.map(note => (
              <li key={note} className="flex gap-1.5">
                <span aria-hidden="true">·</span>
                <span className="min-w-0">{note}</span>
              </li>
            ))}
          </ul>
        )}
        {deploy.status === 'stuck' && (
          <ItemDescription className="text-caption text-foreground">
            {t('system.deploys.stuckHint')}
          </ItemDescription>
        )}
      </ItemContent>
    </Item>
  );
};
