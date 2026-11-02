import { Button } from '@ui/shad-cn/components/button.tsx';
import { Plus, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePluginList } from '../hooks/use-plugin-list';
import { usePluginRemove } from '../hooks/use-plugin-remove';
import { usePluginStatus } from '../hooks/use-plugin-status';
import type { IPluginListItem } from '../types';
import { PluginCreateDrawer } from './PluginCreateDrawer';
import { PluginList } from './PluginList';
import { PluginRemoveDialog } from './PluginRemoveDialog';
import { PluginUploadDrawer } from './PluginUploadDrawer';

/** `/admin/plugins`: installed plugins and the upload of a new plugin ZIP. */
export const PluginArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const { loading, error, plugins, reload } = usePluginList();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const status = usePluginStatus(() => void reload());
  const removal = usePluginRemove(() => void reload());
  const [removing, setRemoving] = useState<IPluginListItem | null>(null);

  const confirmRemove = async (plugin: IPluginListItem) => {
    const result = await removal.remove(plugin.pluginId);
    if (result.success) {
      toast.success(t('plugins.remove.success', { name: plugin.name }));
      setRemoving(null);
    } else {
      toast.error(
        t(`plugins.remove.errors.${result.error ?? 'unknown'}`, {
          defaultValue: t('plugins.remove.errors.unknown'),
        })
      );
    }
  };

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
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus />
        </Button>
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Upload />
        </Button>
      </header>

      <PluginList
        loading={loading}
        error={error}
        plugins={plugins}
        pendingId={status.pending}
        onRetry={reload}
        onToggle={toggle}
        onRemove={setRemoving}
      />

      <PluginRemoveDialog
        plugin={removing}
        busy={removal.busy}
        onOpenChange={open => !open && setRemoving(null)}
        onConfirm={confirmRemove}
      />

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
