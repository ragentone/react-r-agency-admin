import React, { useState } from 'react';

import { usePluginDetail } from '../hooks/use-plugin-detail';
import type { IPluginListItem } from '../types';
import { PluginDeployDrawer } from './PluginDeployDrawer';
import { PluginDetailActions } from './PluginDetailActions';
import { PluginDetailFiles } from './PluginDetailFiles';
import { PluginDetailHeader } from './PluginDetailHeader';
import { PluginDetailInfo } from './PluginDetailInfo';
import { PluginFileEditorDialog } from './PluginFileEditorDialog';
import { PluginNewFileDialog } from './PluginNewFileDialog';
import { PluginRemoveDrawer } from './PluginRemoveDrawer';

interface IPluginDetailViewProps {
  plugin: IPluginListItem;
  reload: () => void;
}

/** The loaded plugin page: header, facts, actions, files and the drawers the page needs. */
export const PluginDetailView: React.FC<IPluginDetailViewProps> = ({ plugin, reload }) => {
  const detail = usePluginDetail(plugin, reload);
  const [deployOpen, setDeployOpen] = useState(false);
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [treeKey, setTreeKey] = useState(0);
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <div className="flex w-full flex-col bg-background">
      <PluginDetailHeader name={plugin.name} pluginId={plugin.pluginId} />
      <PluginDetailInfo plugin={plugin} />

      <div className="flex flex-col gap-4 px-4 py-4">
        <PluginDetailActions
          plugin={plugin}
          detail={detail}
          onDeploy={() => setDeployOpen(true)}
          onRemove={() => setRemoveOpen(true)}
        />
        {plugin.development && (
          <PluginDetailFiles
            pluginId={plugin.pluginId}
            busy={detail.busy}
            reloadKey={treeKey}
            onNewFile={() => setNewFileOpen(true)}
            onOpenFile={setEditPath}
          />
        )}
      </div>

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
          <PluginNewFileDialog
            pluginId={plugin.pluginId}
            open={newFileOpen}
            onOpenChange={setNewFileOpen}
            onCreated={path => {
              setTreeKey(key => key + 1);
              setEditPath(path);
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

      <PluginRemoveDrawer
        plugin={removeOpen ? plugin : null}
        busy={detail.removeBusy}
        onOpenChange={open => !open && setRemoveOpen(false)}
        onConfirm={() => void detail.remove()}
      />
    </div>
  );
};
