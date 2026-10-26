import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import {
  BellRing,
  Check,
  ChevronRight,
  CircleCheck,
  Hammer,
  HardDrive,
  NotebookPen,
  ShieldAlert,
  TriangleAlert,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ADMIN_STATS_ROUTE, ADMIN_SYSTEM_ROUTE } from '../../const';
import { StatsApi } from '../../stats/api';
import { StatsAvatar } from '../../stats/components/common';
import { useStatsQuery } from '../../stats/hooks/use.stats.query';
import { formatAgo } from '../../stats/utils';
import type { ISystemDeployHistory, ISystemStorage } from '../../system/types';
import { formatBytes } from '../../system/utils';
import {
  HOME_IP_ACCOUNTS,
  HOME_IP_FAILURES,
  HOME_SILENT_MAX,
  rememberStatsTab,
  rememberSystemTab,
} from '../utils';
import { HomeError, HomeSection } from './HomeSection';

interface IQuery<D> {
  data: D | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
}

interface IItem {
  id: string;
  /** `alert` = something is wrong, `info` = worth knowing. */
  tone: 'alert' | 'info';
  icon: React.ReactNode;
  title: string;
  text?: string;
  to: string;
  onNavigate: () => void;
}

/**
 * What an admin should look at now – collected from system and statistics. Shows nothing but
 * "all quiet" when there is nothing to do; alerts first.
 */
export const HomeAttention: React.FC<{
  deploys: IQuery<ISystemDeployHistory>;
  storage: IQuery<ISystemStorage>;
  onUser: (userId: string) => void;
}> = ({ deploys, storage, onUser }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const security = useStatsQuery(
    () => StatsApi.security(7),
    result => result.security,
    'home-security',
    300_000
  );
  const growth = useStatsQuery(
    () => StatsApi.growth(30),
    result => result.growth,
    'home-growth'
  );
  const [reminded, setReminded] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const queries = [deploys, storage, security, growth];
  const loading = queries.some(query => query.loading);
  const failed = queries.every(query => query.error);

  const items: IItem[] = [];
  const toSystem = (tab: 'version' | 'storage') => () => rememberSystemTab(tab);

  const history = deploys.data;
  if (history) {
    const stuck = history.deploys.filter(deploy => deploy.status === 'stuck');
    if (stuck.length) {
      items.push({
        id: 'deploy-stuck',
        tone: 'alert',
        icon: <TriangleAlert />,
        title: t('home.attention.stuck', { count: stuck.length }),
        text: t('home.attention.since', { ago: formatAgo(stuck[0].startedAt, locale) }),
        to: ADMIN_SYSTEM_ROUTE,
        onNavigate: toSystem('version'),
      });
    }
    if (history.running > 0) {
      items.push({
        id: 'deploy-running',
        tone: 'info',
        icon: <Hammer />,
        title: t('home.attention.running'),
        text: t('home.attention.runningText'),
        to: ADMIN_SYSTEM_ROUTE,
        onNavigate: toSystem('version'),
      });
    }
    const notes = history.release.plan.notes.length;
    if (notes > 0) {
      items.push({
        id: 'release-notes',
        tone: 'info',
        icon: <NotebookPen />,
        title: t('home.attention.notes', { count: notes }),
        text: t('home.attention.notesText', {
          version: history.release.options[history.release.plan.bump],
        }),
        to: ADMIN_SYSTEM_ROUTE,
        onNavigate: toSystem('version'),
      });
    }
  }

  const disk = storage.data;
  if (disk && disk.disk.percent >= disk.warnPercent) {
    items.push({
      id: 'storage',
      tone: 'alert',
      icon: <HardDrive />,
      title: t('home.attention.storage', { percent: Math.round(disk.disk.percent) }),
      text: t('home.attention.storageText', { free: formatBytes(disk.disk.free, locale) }),
      to: ADMIN_SYSTEM_ROUTE,
      onNavigate: toSystem('storage'),
    });
  }

  if (security.data) {
    const ips = security.data.ips.filter(
      ip => ip.accounts >= HOME_IP_ACCOUNTS || ip.failures >= HOME_IP_FAILURES
    );
    if (ips.length) {
      items.push({
        id: 'ips',
        tone: 'alert',
        icon: <ShieldAlert />,
        title: t('home.attention.ips', { count: ips.length }),
        text: t('home.attention.ipsText'),
        to: ADMIN_STATS_ROUTE,
        onNavigate: () => rememberStatsTab('security', 7),
      });
    }
  }

  items.sort((a, b) => (a.tone === b.tone ? 0 : a.tone === 'alert' ? -1 : 1));
  const silent = (growth.data?.silentUsers ?? []).slice(0, HOME_SILENT_MAX);
  const alerts = items.filter(item => item.tone === 'alert').length;

  const remind = async (userId: string) => {
    setBusy(userId);
    const result = await StatsApi.remind(userId);
    setBusy(null);
    if (result.success) {
      setReminded(previous => new Set(previous).add(userId));
      toast.success(t('stats.growth.reminded'));
    } else {
      toast.error(
        t(result.error === 'invalid' ? 'stats.growth.remindedRecently' : 'stats.error.title')
      );
    }
  };

  let body: React.ReactNode;
  if (loading && !items.length) {
    body = (
      <div className="space-y-2" aria-busy="true">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    );
  } else if (failed) {
    body = (
      <HomeError
        text={t('home.error')}
        retry={t('retry')}
        onRetry={() => queries.forEach(query => query.reload())}
      />
    );
  } else {
    body = (
      <>
        {items.length ? (
          <ul className="overflow-hidden rounded-2xl border border-border/60">
            {items.map(item => (
              <li key={item.id} className="border-b border-border/50 last:border-b-0">
                <Link
                  to={item.to}
                  onClick={item.onNavigate}
                  className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05] focus-visible:outline-none active:bg-foreground/[0.06]"
                >
                  <span
                    className={cn(
                      'grid size-10 shrink-0 place-items-center rounded-full [&>svg]:size-5',
                      item.tone === 'alert'
                        ? 'bg-foreground text-background'
                        : 'bg-foreground/[0.07] text-foreground'
                    )}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-bold text-foreground">{item.title}</span>
                    {item.text && (
                      <span className="block text-caption text-muted-foreground">{item.text}</span>
                    )}
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground/[0.07]">
              <CircleCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-body font-bold">{t('home.attention.quiet')}</span>
              <span className="block text-caption text-muted-foreground">
                {t('home.attention.quietText')}
              </span>
            </span>
          </div>
        )}

        {silent.length > 0 && (
          <div className="pt-1">
            <h3 className="text-body font-bold">{t('stats.growth.silent')}</h3>
            <p className="text-caption text-muted-foreground">{t('home.attention.silentText')}</p>
            <ul className="mt-1 divide-y divide-border/50">
              {silent.map(user => (
                <li key={user.id} className="flex items-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => onUser(user.id)}
                    aria-label={t('home.openUser', { name: user.alias })}
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <StatsAvatar user={user} kind="user" />
                    <span className="min-w-0">
                      <span className="block truncate text-body font-bold">@{user.alias}</span>
                      <span className="block text-caption text-muted-foreground">
                        {t('stats.growth.silentFor', { count: user.days })}
                      </span>
                    </span>
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reminded.has(user.id) || busy === user.id}
                    isLoading={busy === user.id}
                    onClick={() => void remind(user.id)}
                    aria-label={t('stats.growth.remindLabel', { name: user.alias })}
                    className="shrink-0 rounded-full"
                  >
                    {reminded.has(user.id) ? <Check /> : <BellRing />}
                    {t(reminded.has(user.id) ? 'stats.growth.remindDone' : 'stats.growth.remind')}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    );
  }

  return (
    <HomeSection
      title={t('home.attention.title')}
      aside={
        alerts > 0 ? (
          <Badge
            className="rounded-full px-2 tabular-nums"
            aria-label={t('home.attention.count', { count: alerts })}
          >
            {alerts}
          </Badge>
        ) : undefined
      }
    >
      {body}
    </HomeSection>
  );
};
