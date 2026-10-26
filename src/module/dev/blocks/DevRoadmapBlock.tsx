import type { IPageBlockRenderProps, PageBlockData } from '@core/blocks/types.ts';
import { useGraphQlGetter } from '@core/mesh';
import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ArrowRight, CheckCircle2, CircleDashed, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ROADMAP_ROUTE } from '../const';
import { DeveloperRoadmapListQuery } from '../graphql';
import type { IRoadmapItem } from '../types';

/** Settings of the site page block `dev:roadmap` (same keys as runtime apps/developer). */
export interface IDevRoadmapBlockData extends PageBlockData {
  title: string;
  filter: 'active' | 'all' | 'done';
  limit: '10' | '5' | '20';
}

const STATUS = {
  in_progress: { icon: Loader, className: 'text-sky-600 dark:text-sky-400' },
  open: { icon: CircleDashed, className: 'text-muted-foreground' },
  done: { icon: CheckCircle2, className: 'text-emerald-600 dark:text-emerald-400' },
} as const;
const ORDER = { in_progress: 0, open: 1, done: 2 } as const;

/** Public roadmap (`developerRoadmapList`) – in progress first. */
const DevRoadmapBlock: React.FC<IPageBlockRenderProps<IDevRoadmapBlockData>> = ({ data }) => {
  const { t } = useTranslation('dev');
  const getGraphql = useGraphQlGetter();
  const [items, setItems] = useState<IRoadmapItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = (await getGraphql().query({
          query: DeveloperRoadmapListQuery as never,
          fetchPolicy: 'no-cache',
        })) as { data?: { developerRoadmapList?: { success?: boolean; items?: IRoadmapItem[] } } };
        const result = response.data?.developerRoadmapList;
        if (!alive) return;
        if (!result?.success) throw new Error('developerRoadmapList failed');
        setItems(result.items ?? []);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [getGraphql]);

  const visible = (items ?? [])
    .filter(item =>
      data.filter === 'all'
        ? true
        : data.filter === 'done'
          ? item.status === 'done'
          : item.status !== 'done'
    )
    .sort(
      (a, b) =>
        (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) ||
        (b.doneAt ?? b.updatedAt).localeCompare(a.doneAt ?? a.updatedAt)
    )
    .slice(0, Number(data.limit) || 10);

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold tracking-tight">
        {data.title || t('block.roadmap.defaultTitle')}
      </h2>
      {failed ? (
        <p className="text-body text-muted-foreground">{t('block.roadmap.error')}</p>
      ) : items === null ? (
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-body text-muted-foreground">{t('block.roadmap.empty')}</p>
      ) : (
        <ul className="divide-y divide-border/60 rounded-2xl border border-border/60">
          {visible.map(item => {
            const { icon: Icon, className } = STATUS[item.status] ?? STATUS.open;
            return (
              <li key={item.id} className="flex gap-3 p-3">
                <Icon className={cn('mt-0.5 size-5 shrink-0', className)} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.title}</p>
                  {item.description && (
                    <p className="line-clamp-2 text-caption text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  <p className={cn('mt-0.5 text-[11px] font-semibold', className)}>
                    {t(`status.${item.status}`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Link
        to={ROADMAP_ROUTE}
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-border/70 px-5 text-body font-bold transition-colors hover:bg-foreground/[0.04]"
      >
        {t('block.roadmap.more')}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
};

export default DevRoadmapBlock;
