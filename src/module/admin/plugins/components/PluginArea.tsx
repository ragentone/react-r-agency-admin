import { Button } from '@ui/shad-cn/components/button.tsx';
import { Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePluginList } from '../hooks/use-plugin-list';
import { usePluginStatus } from '../hooks/use-plugin-status';
import type { IPluginListItem } from '../types';
import { PluginList } from './PluginList';
import { PluginUploadDrawer } from './PluginUploadDrawer';

/** `/admin/plugins`: installed plugins and the upload of a new plugin ZIP. */
export const PluginArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const { loading, error, plugins, reload } = usePluginList();
  const [uploadOpen, setUploadOpen] = useState(false);
  const status = usePluginStatus(() => void reload());

  const toggle = async (plugin: IPluginListItem, active: boolean) => {
    const result = await status.setStatus(plugin.pluginId, active);
    if (result.success) {
      toast.success(
        t(active ? 'plugins.toggle.activated' : 'plugins.toggle.deactivated', {
          name: plugin.name,
        })
      );
    } else {
      toast.error(
        result.error === 'app_version_too_old'
          ? t('plugins.toggle.appVersionTooOld')
          : t('plugins.toggle.error')
      );
    }
  };

  return (
    <div data-slot="admin-plugins" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
      <header className="flex items-start gap-3 px-4 pt-3 pb-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
            {t('plugins.title')}
          </h1>
          <p className="text-caption text-muted-foreground">{t('plugins.subtitle')}</p>
        </div>
        <Button size="lg" onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" />
          {t('plugins.upload.button')}
        </Button>
      </header>

      <PluginList
        loading={loading}
        error={error}
        plugins={plugins}
        pendingId={status.pending}
        onRetry={reload}
        onToggle={toggle}
      />

      <PluginUploadDrawer
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => void reload()}
      />
    </div>
  );
};
