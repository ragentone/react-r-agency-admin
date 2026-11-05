import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ChevronRight, CircleCheck, HardDrive, NotebookPen } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_SYSTEM_ROUTE } from '../../const';
import type { ISystemDeployHistory, ISystemStorage } from '../../system/types';
import { formatBytes } from '../../system/utils';
import { rememberSystemTab } from '../utils';
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
 * What an admin should look at now – collected from the system. Shows nothing but "all quiet"
 * when there is nothing to do; alerts first.
 */
export const HomeAttention: React.FC<{
  deploys: IQuery<ISystemDeployHistory>;
  storage: IQuery<ISystemStorage>;
}> = ({ deploys, storage }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;

  const queries = [deploys, storage];
  const loading = queries.some(query => query.loading);
  const failed = queries.every(query => query.error);

  const items: IItem[] = [];
  const toSystem = (tab: 'version' | 'storage') => () => rememberSystemTab(tab);

  const history = deploys.data;
  if (history) {
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

  items.sort((a, b) => (a.tone === b.tone ? 0 : a.tone === 'alert' ? -1 : 1));
  const alerts = items.filter(item => item.tone === 'alert').length;

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
  } else if (items.length) {
    body = (
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
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    );
  } else {
    body = (
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
