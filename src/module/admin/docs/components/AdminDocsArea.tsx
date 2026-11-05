import { AppDrawer } from '@ui/patterns';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAdminDocs } from '../hooks/use.admin.docs';
import { AdminDocsList } from './AdminDocsList';
import { AdminDocView } from './AdminDocView';

/** `/admin/docs`: the runtime Markdown docs as a list; a tap opens one in the drawer. */
export const AdminDocsArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const { docs, loading, error, reload } = useAdminDocs();
  const active = docs.find(doc => doc.slug === selected);

  const openDoc = (slug: string) => {
    setSelected(slug);
    setOpen(true);
  };

  return (
    <div data-slot="admin-docs" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="px-4 pt-3 pb-3">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {t('docs.title')}
        </h1>
        <p className="text-caption text-muted-foreground">{t('docs.subtitle')}</p>
      </header>
      <AdminDocsList
        docs={docs}
        loading={loading}
        error={error}
        onOpen={openDoc}
        onRetry={reload}
      />
      <AppDrawer
        open={open && active !== undefined}
        onOpenChange={setOpen}
        title={active?.title ?? ''}
        description={active?.slug}
        size="fullscreen"
        bodyKey={active?.slug}
      >
        {active && <AdminDocView doc={active} />}
      </AppDrawer>
    </div>
  );
};
