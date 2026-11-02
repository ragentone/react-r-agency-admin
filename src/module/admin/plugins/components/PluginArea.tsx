import { Button } from '@ui/shad-cn/components/button.tsx';
import { Plus, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePluginList } from '../hooks/use-plugin-list';
import { PluginCreateDrawer } from './PluginCreateDrawer';
import { PluginList } from './PluginList';
import { PluginUploadDrawer } from './PluginUploadDrawer';

/** `/admin/plugins`: installed plugins (each opens its page) and creating/uploading plugins. */
export const PluginArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const { loading, error, plugins, reload } = usePluginList();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div data-slot="admin-plugins" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="flex items-start gap-3 px-4 pt-3 pb-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {t('plugins.title')}
          </h1>
          <p className="text-caption text-muted-foreground">{t('plugins.subtitle')}</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
        </Button>
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Upload />
        </Button>
      </header>

      <PluginList loading={loading} error={error} plugins={plugins} onRetry={reload} />

      <PluginCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={pluginId => {
          toast.success(t('plugins.create.success', { id: pluginId }));
          void reload();
        }}
      />

      <PluginUploadDrawer
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => void reload()}
      />
    </div>
  );
};
