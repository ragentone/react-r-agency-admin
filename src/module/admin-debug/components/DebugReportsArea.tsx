import React from 'react';
import { useTranslation } from 'react-i18next';

import { DebugReportsTable } from './DebugReportsTable';

/** `/admin/debug`: client debug reports from frontend and app. */
export const DebugReportsArea: React.FC = () => {
  const { t } = useTranslation('admin-debug');
  return (
    <div data-slot="admin-debug" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="px-4 pt-3 pb-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h1>
        <p className="text-caption text-muted-foreground">{t('subtitle')}</p>
      </header>
      <DebugReportsTable />
    </div>
  );
};
