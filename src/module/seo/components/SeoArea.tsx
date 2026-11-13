import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Tabs, TabsContent } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPage } from '../../admin/ui/AdminPage';
import { AdminPanel } from '../../admin/ui/AdminPanel';
import { AdminTabsBar } from '../../admin/ui/AdminTabsBar';
import type { SeoTab } from '../types';
import { useSeoAdmin } from '../use.seo.admin';
import { SeoRoutesTab } from './SeoRoutesTab';
import { SeoSettingsTab } from './SeoSettingsTab';
import { SeoSitemapTab } from './SeoSitemapTab';

const TABS: SeoTab[] = ['routes', 'settings', 'sitemap'];
const STORE_KEY = 'admin-seo-view';

const restore = (): SeoTab => {
  try {
    const value = localStorage.getItem(STORE_KEY) as SeoTab | null;
    return value && TABS.includes(value) ? value : 'routes';
  } catch {
    return 'routes';
  }
};

const Loading: React.FC = () => (
  <div className="space-y-5 px-4 py-4" aria-busy="true">
    <Skeleton className="h-11 w-full rounded-full" />
    {[0, 1, 2, 3].map(i => (
      <div key={i} className="flex gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-1/3 rounded-full" />
          <Skeleton className="h-3 w-2/3 rounded-full" />
          <Skeleton className="h-5 w-1/4 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

/** `/admin/seo`: meta data per path, site defaults, sitemap. */
export const SeoArea: React.FC = () => {
  const { t } = useTranslation('seo');
  const admin = useSeoAdmin();
  const [tab, setTab] = useState(restore);
  const change = (next: string) => {
    setTab(next as SeoTab);
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      // per-device convenience only
    }
  };

  const data = admin.data;
  let content: React.ReactNode;
  if (!data && admin.loading) content = <Loading />;
  else if (!data) {
    content = (
      <div role="alert" className="px-8 py-16 text-center">
        <p className="text-body text-muted-foreground">{t('error.load')}</p>
        <Button className="mt-4 font-bold" onClick={admin.retry}>
          {t('retry')}
        </Button>
      </div>
    );
  } else {
    content = (
      <>
        <TabsContent value="routes" className="mt-0 pb-10">
          <SeoRoutesTab admin={admin} />
        </TabsContent>
        <TabsContent value="settings" className="mt-0 pb-10">
          <SeoSettingsTab
            key={JSON.stringify(data.settings)}
            admin={admin}
            settings={data.settings}
          />
        </TabsContent>
        <TabsContent value="sitemap" className="mt-0 pb-10">
          <SeoSitemapTab admin={admin} sitemap={data.sitemap} indexing={data.settings.indexing} />
        </TabsContent>
      </>
    );
  }

  return (
    <AdminPage slot="admin-seo">
      <Tabs value={tab} onValueChange={change} className="flex flex-col gap-4">
        <AdminTabsBar
          label={t('tabsLabel')}
          tabs={TABS.map(item => ({
            value: item,
            label: t(`tabs.${item}`),
            count: item === 'routes' ? data?.routes.length : undefined,
          }))}
        />
        <AdminPanel flush={true}>{content}</AdminPanel>
      </Tabs>
    </AdminPage>
  );
};
