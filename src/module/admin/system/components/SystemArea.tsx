import { cn } from '@ui/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ADMIN_SYSTEM_VIEW_KEY } from '../../const';
import type { SystemTab } from '../types';
import { SystemDeploysTab } from './SystemDeploysTab';
import { SystemStorageTab } from './SystemStorageTab';

const TABS: SystemTab[] = ['version', 'storage'];
const STORE_KEY = ADMIN_SYSTEM_VIEW_KEY;

const restore = (): SystemTab => {
  try {
    const value = localStorage.getItem(STORE_KEY) as SystemTab | null;
    return value && TABS.includes(value) ? value : 'version';
  } catch {
    return 'version';
  }
};

/** `/admin/system`: version + deploys, server storage. */
export const SystemArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const [tab, setTab] = useState(restore);
  const change = (next: string) => {
    setTab(next as SystemTab);
    try {
      localStorage.setItem(STORE_KEY, next);
    } catch {
      // per-device convenience only
    }
  };

  return (
    <div data-slot="admin-system" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="px-4 pt-3 pb-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {t('system.title')}
        </h1>
        <p className="text-caption text-muted-foreground">{t('system.subtitle')}</p>
      </header>

      <Tabs value={tab} onValueChange={change} className="flex flex-1 flex-col">
        <TabsList
          aria-label={t('system.tabsLabel')}
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
              {t(`system.tabs.${item}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="version" className="mt-0 pb-10">
          <SystemDeploysTab />
        </TabsContent>
        <TabsContent value="storage" className="mt-0 pb-10">
          <SystemStorageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
