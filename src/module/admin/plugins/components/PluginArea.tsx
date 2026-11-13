import { Tabs, TabsContent } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminPage } from '../../ui/AdminPage';
import { AdminPanel } from '../../ui/AdminPanel';
import { AdminTabsBar } from '../../ui/AdminTabsBar';
import { usePluginList } from '../hooks/use-plugin-list';
import { usePluginUnknown } from '../hooks/use-plugin-unknown';
import type { IPluginUnknownItem } from '../types';
import { PluginCreateDrawer } from './PluginCreateDrawer';
import { PluginList } from './PluginList';
import { PluginUnknownList } from './PluginUnknownList';
import { PluginUnknownRemoveDrawer } from './PluginUnknownRemoveDrawer';
import { PluginUploadDrawer } from './PluginUploadDrawer';

interface IPluginAreaProps {
  uploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  createOpen: boolean;
  setCreateOpen: (open: boolean) => void;
}

/** `/admin/plugins`: installed plugins, folders without registry entry (tab "Development"), creating and uploading. */
export const PluginArea: React.FC<IPluginAreaProps> = ({
  uploadOpen,
  setUploadOpen,
  createOpen,
  setCreateOpen,
}) => {
  const { t } = useTranslation('admin');
  const installed = usePluginList();
  const unknown = usePluginUnknown(() => void installed.reload());
  const [tab, setTab] = useState('installed');
  const [removeTarget, setRemoveTarget] = useState<IPluginUnknownItem | null>(null);

  const failure = (code?: string | null) =>
    t(`plugins.unknown.errors.${code ?? 'unknown'}`, { defaultValue: t('plugins.unknown.failed') });

  const adopt = async (plugin: IPluginUnknownItem) => {
    const result = await unknown.adopt(plugin.pluginId);
    if (result.success) toast.success(t('plugins.unknown.installed', { id: plugin.pluginId }));
    else toast.error(failure(result.error));
  };

  const confirmRemove = async (plugin: IPluginUnknownItem) => {
    const result = await unknown.remove(plugin.pluginId);
    if (result.success) {
      toast.success(t('plugins.unknown.removed', { id: plugin.pluginId }));
      setRemoveTarget(null);
    } else {
      toast.error(failure(result.error));
    }
  };

  return (
    <AdminPage slot="admin-plugins">
      <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-4">
        <AdminTabsBar
          label={t('plugins.title')}
          tabs={[
            { value: 'installed', label: t('plugins.tabs.installed') },
            {
              value: 'development',
              label: t('plugins.tabs.unknown'),
              count: unknown.plugins.length,
            },
          ]}
        />

        <AdminPanel flush={true}>
          <TabsContent value="installed" className="mt-0">
            <PluginList
              loading={installed.loading}
              error={installed.error}
              plugins={installed.plugins}
              onRetry={() => void installed.reload()}
              onCreate={() => setCreateOpen(true)}
            />
          </TabsContent>

          <TabsContent value="development" className="mt-0">
            <PluginUnknownList
              loading={unknown.loading}
              error={unknown.error}
              plugins={unknown.plugins}
              busy={unknown.busy}
              onRetry={() => void unknown.reload()}
              onInstall={plugin => void adopt(plugin)}
              onRemove={setRemoveTarget}
            />
          </TabsContent>
        </AdminPanel>
      </Tabs>

      <PluginCreateDrawer
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={pluginId => {
          toast.success(t('plugins.create.success', { id: pluginId }));
          void unknown.reload();
          setTab('development');
        }}
      />

      <PluginUploadDrawer
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => void installed.reload()}
      />

      <PluginUnknownRemoveDrawer
        plugin={removeTarget}
        busy={unknown.busy}
        onOpenChange={open => !open && setRemoveTarget(null)}
        onConfirm={plugin => void confirmRemove(plugin)}
      />
    </AdminPage>
  );
};
