import { cn } from '@ui/lib/utils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAdminRoleUpdate } from '../hooks';
import { AdminSelfView } from './AdminSelfView';
import { AdminUsersView } from './AdminUsersView';

type Tab = 'users' | 'self';
const TABS: Tab[] = ['users', 'self'];

/** `/admin` (user management): title + tabs "Users | My roles". Pages: `AdminPagesArea`. */
export const AdminArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const [tab, setTab] = useState<Tab>('users');
  const { saving, update } = useAdminRoleUpdate();
  const shared = { saving, onUpdate: update };

  return (
    <div data-slot="admin" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="border-b border-border/50">
        <div className="px-4 pt-3">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {t('title')}
          </h1>
          <p className="text-caption text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div role="tablist" aria-label={t('title')} className="mt-1 grid grid-cols-2 px-2">
          {TABS.map(value => (
            <button
              key={value}
              id={`admin-tab-${value}`}
              type="button"
              role="tab"
              aria-selected={tab === value}
              aria-controls={`admin-panel-${value}`}
              onClick={() => setTab(value)}
              className={cn(
                'relative h-11 text-body font-semibold transition-colors',
                tab === value ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(`tabs.${value}`)}
              {tab === value && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-foreground"
                />
              )}
            </button>
          ))}
        </div>
      </header>

      <div
        id={`admin-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`admin-tab-${tab}`}
        className="flex-1"
      >
        {tab === 'users' && <AdminUsersView {...shared} />}
        {tab === 'self' && <AdminSelfView {...shared} />}
      </div>
    </div>
  );
};
