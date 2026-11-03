import { Button } from '@ui/shad-cn/components/button.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import { Plus, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePluginList } from '../hooks/use-plugin-list';
import { usePluginUnknown } from '../hooks/use-plugin-unknown';
import type { IPluginUnknownItem } from '../types';
import { PluginCreateDrawer } from './PluginCreateDrawer';
import { PluginList } from './PluginList';
import { PluginUnknownList } from './PluginUnknownList';
import { PluginUnknownRemoveDrawer } from './PluginUnknownRemoveDrawer';
import { PluginUploadDrawer } from './PluginUploadDrawer';

/** `/admin/plugins`: installed plugins, folders without registry entry (tab "Development"), creating and uploading. */
export const PluginArea: React.FC = () => {
  const { t } = useTranslation('admin');
  const installed = usePluginList();
  const unknown = usePluginUnknown(() => void installed.reload());
  const [tab, setTab] = useState('installed');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
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
    <div data-slot="admin-plugins" className="flex min-h-dvh w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur">
        <h1 className="min-w-0 flex-1 truncate text-title font-bold text-foreground">{t('plugins.title')}</h1>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('plugins.actions.upload')}
          onClick={() => setUploadOpen(true)}
        >
          <Upload className="size-5" />
        </Button>
        <Button size="icon" aria-label={t('plugins.actions.create')} onClick={() => setCreateOpen(true)}>
          <Plus className="size-5" />
        </Button>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="flex flex-col">
        <div className="px-4 pt-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="installed">{t('plugins.tabs.installed')}</TabsTrigger>
            <TabsTrigger value="development">
              {t('plugins.tabs.unknown')}
              {unknown.plugins.length > 0 && (
                <span className="ml-1.5 tabular-nums">({unknown.plugins.length})</span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

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
    </div>
  );
};
