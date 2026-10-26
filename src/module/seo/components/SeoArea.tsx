import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    <div data-slot="admin-seo" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="px-4 pt-3 pb-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{t('title')}</h1>
        <p className="text-caption text-muted-foreground">{t('subtitle')}</p>
      </header>

      <Tabs value={tab} onValueChange={change} className="flex flex-1 flex-col">
        <TabsList
          aria-label={t('tabsLabel')}
          className="sticky top-0 z-10 flex h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border/50 bg-background/90 p-0 text-muted-foreground backdrop-blur [scrollbar-width:none]"
        >
          {TABS.map(item => (
            <TabsTrigger
              key={item}
              value={item}
              className={cn(
                'relative min-h-12 flex-1 shrink-0 rounded-none px-4 text-body font-semibold shadow-none',
                'data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground data-[state=active]:shadow-none',
                'after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-12 after:-translate-x-1/2 after:rounded-full after:bg-foreground after:opacity-0 data-[state=active]:after:opacity-100'
              )}
            >
              {t(`tabs.${item}`)}
              {item === 'routes' && data && (
                <span className="ml-1.5 text-caption font-normal tabular-nums opacity-70">
                  {data.routes.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {content}
      </Tabs>
    </div>
  );
};
