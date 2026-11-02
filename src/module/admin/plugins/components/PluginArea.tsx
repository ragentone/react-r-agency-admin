import { Button } from '@ui/shad-cn/components/button.tsx';
import { Plus, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePluginDeploy } from '../hooks/use-plugin-deploy';
import { usePluginList } from '../hooks/use-plugin-list';
import { usePluginRemove } from '../hooks/use-plugin-remove';
import { usePluginStatus } from '../hooks/use-plugin-status';
import type { IPluginListItem } from '../types';
import type { PluginBump } from '../version';
import { PluginCreateDrawer } from './PluginCreateDrawer';
import { PluginDetails } from './PluginDetails';
import { PluginList } from './PluginList';
import { PluginRemoveDrawer } from './PluginRemoveDrawer';
import { PluginUploadDrawer } from './PluginUploadDrawer';

/** `/admin/plugins`: installed plugins, their details with all actions, and creating/uploading plugins. */
export const PluginArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const { loading, error, plugins, reload } = usePluginList();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const status = usePluginStatus(() => void reload());
  const removal = usePluginRemove(() => void reload());
  const deployment = usePluginDeploy(() => void reload());
  const [deployingId, setDeployingId] = useState<string | null>(null);
  // The drawer is open while `selected` is set; list refreshes only update the data inside it.
  const [selected, setSelected] = useState<IPluginListItem | null>(null);
  // Read from the list so the details show the state after every change.
  const current = selected
    ? (plugins.find(plugin => plugin.pluginId === selected.pluginId) ?? selected)
    : null;
  const [removing, setRemoving] = useState<IPluginListItem | null>(null);
  const busy = status.pending !== null || deployingId !== null;

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

  const deploy = async (plugin: IPluginListItem, bump: PluginBump) => {
    setDeployingId(plugin.pluginId);
    const result = await deployment.deploy(plugin.pluginId, bump);
    setDeployingId(null);
    if (result.success) {
      toast.success(
        t('plugins.deploy.success', {
          name: plugin.name,
          version: result.plugin?.version ?? plugin.version,
        })
      );
    } else {
      toast.error(
        t(`plugins.deploy.errors.${result.error ?? 'unknown'}`, {
          defaultValue: t('plugins.deploy.errors.unknown'),
        }),
        { description: result.errors?.join('\n') || undefined }
      );
    }
  };

  const openRemove = (plugin: IPluginListItem) => {
    setSelected(null);
    setRemoving(plugin);
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
        onRetry={reload}
        onSelect={setSelected}
      />

      <PluginDetails
        open={selected !== null}
        plugin={current}
        pending={busy}
        onOpenChange={open => !open && setSelected(null)}
        onToggle={toggle}
        onDeploy={deploy}
        onRemove={openRemove}
      />

      <PluginRemoveDrawer
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
