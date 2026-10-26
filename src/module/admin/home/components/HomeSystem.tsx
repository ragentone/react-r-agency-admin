import { Progress } from '@ui/shad-cn/components/progress.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { HardDrive, Rocket } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_SYSTEM_ROUTE } from '../../const';
import { formatAgo, formatDuration } from '../../stats/utils';
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

/** Live version, last build and server disk in two short rows. */
export const HomeSystem: React.FC<{
  deploys: IQuery<ISystemDeployHistory>;
  storage: IQuery<ISystemStorage>;
  className?: string;
}> = ({ deploys, storage, className }) => {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language;
  const history = deploys.data;
  const last = history?.deploys.find(deploy => deploy.status === 'done');
  const disk = storage.data?.disk;

  return (
    <HomeSection
      title={t('home.system.title')}
      to={ADMIN_SYSTEM_ROUTE}
      linkLabel={t('home.more')}
      onNavigate={() => rememberSystemTab('version')}
      className={className}
    >
      <dl className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <dt className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground/[0.07]">
            <Rocket className="size-5" aria-hidden="true" />
            <span className="sr-only">{t('home.system.version')}</span>
          </dt>
          <dd className="min-w-0 flex-1">
            {deploys.loading ? (
              <Skeleton className="mt-1 h-9 w-2/3 rounded-lg" />
            ) : deploys.error || !history ? (
              <HomeError
                text={t('home.error')}
                retry={t('retry')}
                onRetry={() => deploys.reload()}
              />
            ) : (
              <>
                <span className="block text-body font-bold tabular-nums">
                  {history.release.current
                    ? t('system.deploys.version', { version: history.release.current })
                    : '–'}
                </span>
                <span className="block text-caption text-muted-foreground">
                  {last
                    ? t('home.system.lastBuild', {
                        ago: formatAgo(last.finishedAt ?? last.startedAt, locale),
                        duration:
                          last.durationMs === null ? '–' : formatDuration(last.durationMs / 1000),
                      })
                    : t('home.system.noBuild')}
                </span>
              </>
            )}
          </dd>
        </div>

        <div className="flex items-start gap-3">
          <dt className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground/[0.07]">
            <HardDrive className="size-5" aria-hidden="true" />
            <span className="sr-only">{t('home.system.storage')}</span>
          </dt>
          <dd className="min-w-0 flex-1">
            {storage.loading ? (
              <Skeleton className="mt-1 h-9 w-2/3 rounded-lg" />
            ) : storage.error || !disk ? (
              <HomeError
                text={t('home.error')}
                retry={t('retry')}
                onRetry={() => storage.reload()}
              />
            ) : (
              <>
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-body font-bold tabular-nums">
                    {t('system.storage.used', { percent: Math.round(disk.percent) })}
                  </span>
                  <span className="truncate text-caption text-muted-foreground">
                    {t('home.system.free', { free: formatBytes(disk.free, locale) })}
                  </span>
                </span>
                <Progress
                  value={disk.percent}
                  className="mt-2 h-2 bg-foreground/[0.08]"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(disk.percent)}
                  aria-label={t('home.system.storage')}
                />
              </>
            )}
          </dd>
        </div>
      </dl>
    </HomeSection>
  );
};
