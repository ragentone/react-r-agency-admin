import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PokerAdminHands } from './PokerAdminHands.tsx';
import { PokerAdminLive } from './PokerAdminLive.tsx';
import { PokerAdminPairs } from './PokerAdminPairs.tsx';
import { PokerAdminSettings } from './PokerAdminSettings.tsx';

type Tab = 'live' | 'settings' | 'hands' | 'pairs';
const TABS: Tab[] = ['live', 'settings', 'hands', 'pairs'];

/** `/admin/poker`: live tables, settings, hand history and chip-dumping checks. */
export const PokerAdminView: React.FC = () => {
  const { t } = useTranslation('poker');
  const [tab, setTab] = useState<Tab>('live');
  /** Pairs → "show hands" fills the search of the hands tab. */
  const [handsUser, setHandsUser] = useState('');

  const showHands = (alias: string) => {
    setHandsUser(alias);
    setTab('hands');
  };

  return (
    <Tabs
      value={tab}
      onValueChange={value => setTab(value as Tab)}
      className="mx-auto flex min-h-dvh w-full flex-col bg-background"
    >
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
        <div className="px-4 pt-3 pb-1">
          <h1 className="truncate text-xl font-bold tracking-tight">{t('admin.title')}</h1>
          <p className="truncate text-caption text-muted-foreground">{t('admin.subtitle')}</p>
        </div>
        <TabsList className="flex h-auto w-full rounded-none bg-transparent p-0">
          {TABS.map(item => (
            <TabsTrigger
              key={item}
              value={item}
              className="relative h-12 min-w-0 flex-1 rounded-none px-2 text-body font-medium text-muted-foreground shadow-none! data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground data-[state=active]:after:absolute data-[state=active]:after:inset-x-4 data-[state=active]:after:bottom-0 data-[state=active]:after:h-1 data-[state=active]:after:rounded-full data-[state=active]:after:bg-foreground"
            >
              <span className="truncate">{t(`admin.tabs.${item}`)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </header>
      <div className="flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <TabsContent value="live" className="mt-0">
          <PokerAdminLive />
        </TabsContent>
        <TabsContent value="settings" className="mt-0">
          <PokerAdminSettings />
        </TabsContent>
        <TabsContent value="hands" className="mt-0">
          <PokerAdminHands key={handsUser} initialUser={handsUser} />
        </TabsContent>
        <TabsContent value="pairs" className="mt-0">
          <PokerAdminPairs onShowHands={showHands} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

/** Small stat tile (label above, number below). */
export const PokerStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0 rounded-2xl bg-foreground/[0.04] px-3 py-2.5">
    <dt className="truncate text-micro font-semibold text-muted-foreground uppercase">{label}</dt>
    <dd className="mt-0.5 truncate text-title font-bold tabular-nums">{value}</dd>
  </div>
);

/** Section title inside a tab. */
export const PokerSection: React.FC<{ title: string; action?: React.ReactNode }> = ({
  title,
  action,
}) => (
  <div className="flex items-center justify-between gap-2 px-4 pt-5 pb-2">
    <h2 className="text-title font-extrabold">{title}</h2>
    {action}
  </div>
);
