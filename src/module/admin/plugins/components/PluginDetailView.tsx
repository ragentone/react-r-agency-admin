import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginDetail } from '../hooks/use-plugin-detail';
import type { IPluginListItem } from '../types';
import { PluginConfigDrawer } from './PluginConfigDrawer';
import { PluginConfigFieldsTable } from './PluginConfigFieldsTable';
import { PluginDeployDrawer } from './PluginDeployDrawer';
import { PluginDetailActions } from './PluginDetailActions';
import { PluginDetailActivation } from './PluginDetailActivation';
import { PluginDetailFiles } from './PluginDetailFiles';
import { PluginDetailHeader } from './PluginDetailHeader';
import { PluginDetailInfo } from './PluginDetailInfo';
import { PluginFileEditorDialog } from './PluginFileEditorDialog';
import { PluginManifestView } from './PluginManifestView';
import { PluginPurgeDrawer } from './PluginPurgeDrawer';
import { PluginRemoveDrawer } from './PluginRemoveDrawer';

interface IPluginDetailViewProps {
  plugin: IPluginListItem;
  reload: () => void;
}

/**
 * The loaded plugin page: header with actions, then tabs. "General" is always there; configuration
 * fields and files are tabs of development plugins only.
 */
export const PluginDetailView: React.FC<IPluginDetailViewProps> = ({ plugin, reload }) => {
  const { t } = useTranslation('admin');
  const detail = usePluginDetail(plugin, reload);
  const [tab, setTab] = useState('general');
  const [deployOpen, setDeployOpen] = useState(false);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <div className="flex w-full flex-col bg-background">
      <PluginDetailHeader
        name={plugin.name}
        pluginId={plugin.pluginId}
        actions={
          <PluginDetailActions
            plugin={plugin}
            detail={detail}
            onDeploy={() => setDeployOpen(true)}
            onRemove={() => setRemoveOpen(true)}
            onPurge={() => setPurgeOpen(true)}
            onConfig={() => setConfigOpen(true)}
          />
        }
      />

      <div className="px-4 pt-4">
        <PluginDetailActivation plugin={plugin} detail={detail} />
      </div>

      <Tabs
        value={plugin.development ? tab : 'general'}
        onValueChange={setTab}
        className="flex flex-col"
      >
        {plugin.development && (
          <div className="px-4 pt-3">
            <TabsList className="flex w-full justify-start overflow-x-auto scrollbar-none">
              <TabsTrigger value="general" className="shrink-0">{t('plugins.details.tabs.general')}</TabsTrigger>
              <TabsTrigger value="config" className="shrink-0">{t('plugins.details.tabs.config')}</TabsTrigger>
              <TabsTrigger value="manifest" className="shrink-0">plugin.json</TabsTrigger>
              <TabsTrigger value="files" className="shrink-0">{t('plugins.code.files')}</TabsTrigger>
            </TabsList>
          </div>
        )}

        <TabsContent value="general" className="mt-0">
          <PluginDetailInfo plugin={plugin} />
        </TabsContent>

        {plugin.development && (
          <TabsContent value="config" className="mt-0 px-4 py-6">
            <PluginConfigFieldsTable pluginId={plugin.pluginId} />
          </TabsContent>
        )}

        {plugin.development && (
          <TabsContent value="manifest" className="mt-0 px-4 py-6">
            <PluginManifestView pluginId={plugin.pluginId} />
          </TabsContent>
        )}

        {plugin.development && (
          <TabsContent value="files" className="mt-0 px-4 py-6">
            <PluginDetailFiles pluginId={plugin.pluginId} onOpenFile={setEditPath} />
          </TabsContent>
        )}
      </Tabs>

      {plugin.development && (
        <>
          <PluginDeployDrawer
            open={deployOpen}
            plugin={plugin}
            busy={detail.busy}
            onOpenChange={setDeployOpen}
            onDeploy={async bump => {
              await detail.deploy(bump);
              setDeployOpen(false);
            }}
          />
          <PluginFileEditorDialog
            pluginId={plugin.pluginId}
            pluginName={plugin.name}
            path={editPath}
            onClose={() => setEditPath(null)}
          />
        </>
      )}

      <PluginConfigDrawer open={configOpen} plugin={plugin} onOpenChange={setConfigOpen} />

      <PluginRemoveDrawer
        plugin={removeOpen ? plugin : null}
        busy={detail.removeBusy}
        onOpenChange={open => !open && setRemoveOpen(false)}
        onConfirm={(_, withData) => void detail.remove(withData)}
      />

      <PluginPurgeDrawer
        plugin={purgeOpen ? plugin : null}
        busy={detail.purgeBusy}
        onOpenChange={open => !open && setPurgeOpen(false)}
        onConfirm={() => void detail.purge().then(ok => ok && setPurgeOpen(false))}
      />
    </div>
  );
};
