import React from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPagesView } from './AdminPagesView';

/** `/admin/pages`: dynamic pages (list, create, edit, delete) – separate from user management. */
export const AdminPagesArea: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <div data-slot="admin-pages" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="border-b border-border/50 px-4 pt-3 pb-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {t('pagesArea.title')}
        </h1>
        <p className="text-caption text-muted-foreground">{t('pagesArea.subtitle')}</p>
      </header>
      <div className="flex-1">
        <AdminPagesView />
      </div>
    </div>
  );
};
