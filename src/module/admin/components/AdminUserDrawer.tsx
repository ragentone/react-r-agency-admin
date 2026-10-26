import { AdminBanPanel } from '@core/security/components/AdminBanPanel.tsx';
import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminActivityPanel } from '../stats/components/AdminActivityPanel';
import type { AdminRoleUpdate, IAdminRoleResult, IAdminUser } from '../types';
import { AdminRoleEditor } from './AdminRoleEditor';
import { AdminUserHeader } from './AdminUserHeader';

type DrawerTab = 'roles' | 'activity';

export interface IAdminUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: IAdminUser | null;
  saving: boolean;
  onUpdate: (user: IAdminUser, change: AdminRoleUpdate) => Promise<IAdminRoleResult>;
  onChanged: (user: IAdminUser) => void;
  /** Tab when the drawer opens (statistics → "activity"). */
  initialTab?: DrawerTab;
}

/** Bottom drawer: one user – tabs "Roles" (roles + ban) and "Activity" (visitor statistics). */
export const AdminUserDrawer: React.FC<IAdminUserDrawerProps> = ({
  open,
  onOpenChange,
  user,
  saving,
  onUpdate,
  onChanged,
  initialTab = 'roles',
}) => {
  const { t } = useTranslation('admin');
  const [tab, setTab] = useState<DrawerTab>(initialTab);
  const close = (next: boolean) => {
    if (!saving) onOpenChange(next);
  };

  // Every opening (or another user) starts on `initialTab`.
  const resetKey = `${open}|${user?.id ?? ''}|${initialTab}`;
  const [lastKey, setLastKey] = useState(resetKey);
  if (lastKey !== resetKey) {
    setLastKey(resetKey);
    if (open) setTab(initialTab);
  }

  const trigger = cn(
    'relative min-h-11 flex-1 rounded-none text-body font-semibold shadow-none',
    'data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-foreground data-[state=active]:shadow-none',
    'after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-12 after:-translate-x-1/2 after:rounded-full after:bg-foreground after:opacity-0 data-[state=active]:after:opacity-100'
  );

  return (
    <Tabs value={tab} onValueChange={value => setTab(value as DrawerTab)}>
      <AppDrawer
        open={open}
        onOpenChange={close}
        title={t('drawer.title')}
        description={t('drawer.description')}
        closeLabel={t('drawer.close')}
        locked={saving}
        bodyKey={tab}
        bodyClassName="space-y-6 py-5 sm:px-6"
        subHeader={
          <TabsList
            aria-label={t('drawer.tabsLabel')}
            className="flex h-auto w-full rounded-none border-b border-border/50 bg-transparent p-0 text-muted-foreground"
          >
            <TabsTrigger value="roles" className={trigger}>
              {t('drawer.tabs.roles')}
            </TabsTrigger>
            <TabsTrigger value="activity" className={trigger}>
              {t('drawer.tabs.activity')}
            </TabsTrigger>
          </TabsList>
        }
      >
        {user && (
          <>
            <AdminUserHeader user={user} />
            <TabsContent value="roles" className="mt-0 space-y-6">
              <AdminRoleEditor
                user={user}
                saving={saving}
                onUpdate={onUpdate}
                onChanged={onChanged}
              />
              {!user.superUser && (
                <AdminBanPanel key={user.id} userId={user.id} disabled={saving} />
              )}
            </TabsContent>
            <TabsContent value="activity" className="mt-0">
              <AdminActivityPanel key={user.id} userId={user.id} />
            </TabsContent>
          </>
        )}
      </AppDrawer>
    </Tabs>
  );
};
