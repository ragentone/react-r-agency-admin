import React, { useState } from 'react';

import { usePluginDetail } from '../hooks/use-plugin-detail';
import type { IPluginListItem } from '../types';
import { PluginDeployDrawer } from './PluginDeployDrawer';
import { PluginDetailActions } from './PluginDetailActions';
import { PluginDetailFiles } from './PluginDetailFiles';
import { PluginDetailHeader } from './PluginDetailHeader';
import { PluginDetailInfo } from './PluginDetailInfo';
import { PluginFileEditorDialog } from './PluginFileEditorDialog';
import { PluginPurgeDrawer } from './PluginPurgeDrawer';
import { PluginRemoveDrawer } from './PluginRemoveDrawer';

interface IPluginDetailViewProps {
  plugin: IPluginListItem;
  reload: () => void;
}

/** The loaded plugin page: header, facts, actions, files and the drawers the page needs. */
export const PluginDetailView: React.FC<IPluginDetailViewProps> = ({ plugin, reload }) => {
  const detail = usePluginDetail(plugin, reload);
  const [deployOpen, setDeployOpen] = useState(false);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [purgeOpen, setPurgeOpen] = useState(false);

  return (
    <div className="flex w-full flex-col bg-background">
      <PluginDetailHeader name={plugin.name} pluginId={plugin.pluginId} />
      <div className={'grid sm:grid-cols-2 grid-cols-1 gap-2 py-8 px-4 border-b border-border/50'}>
        <PluginDetailInfo plugin={plugin} />
        <PluginDetailActions
          plugin={plugin}
          detail={detail}
          onDeploy={() => setDeployOpen(true)}
          onRemove={() => setRemoveOpen(true)}
          onPurge={() => setPurgeOpen(true)}
        />
      </div>

      <div className="flex flex-col gap-4 px-4 py-4">
        {plugin.development && (
          <PluginDetailFiles pluginId={plugin.pluginId} onOpenFile={setEditPath} />
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
