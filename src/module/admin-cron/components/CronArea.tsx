import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HomeError } from '../../admin/home/components/HomeSection';
import { AdminPage } from '../../admin/ui/AdminPage';
import { useCronJobs } from '../hooks/use-cron';
import type { CronFilter, ICronJob } from '../types';
import { filterJobs } from '../utils';
import { CronDrawer } from './CronDrawer';
import { CronList } from './CronList';
import { CronToolbar } from './CronToolbar';

/** Composes the cron page: search + filter, job list, detail drawer. */
export const CronArea: React.FC = () => {
  const { t } = useTranslation('admin-cron');
  const { data, loading, error, reload } = useCronJobs();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CronFilter>('all');
  const [openName, setOpenName] = useState<string | null>(null);

  const jobs = useMemo(() => filterJobs(data ?? [], filter, query), [data, filter, query]);
  // Keep the drawer in sync with the polled list (status / next run).
  const open: ICronJob | null = data?.find(job => job.name === openName) ?? null;

  if (loading) return <Skeleton className="h-72 rounded-xl" />;
  if (error && !data) {
    return <HomeError text={t('error.load')} retry={t('retry')} onRetry={() => void reload()} />;
  }

  return (
    <AdminPage>
      <div className="overflow-hidden rounded-xl border border-border/50">
        <CronToolbar query={query} filter={filter} onQuery={setQuery} onFilter={setFilter} />
        <CronList
          jobs={jobs}
          filtered={query !== '' || filter !== 'all'}
          onOpen={job => setOpenName(job.name)}
        />
      </div>
      <CronDrawer job={open} onClose={() => setOpenName(null)} onChanged={() => void reload()} />
    </AdminPage>
  );
};
