import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/shad-cn/components/dialog.tsx';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { ArrowLeft, Download, FilePlus, Hammer, Rocket, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ADMIN_PLUGINS_ROUTE } from '../../const';
import { PluginApi } from '../api';
import { saveZip } from '../download';
import { usePluginBuild } from '../hooks/use-plugin-build';
import { usePluginDeploy } from '../hooks/use-plugin-deploy';
import { usePluginList } from '../hooks/use-plugin-list';
import { usePluginRemove } from '../hooks/use-plugin-remove';
import { usePluginStatus } from '../hooks/use-plugin-status';
import type { IPluginListItem } from '../types';
import { bumpVersion, type PluginBump } from '../version';
import { PluginFileEditorDialog } from './PluginFileEditorDialog';
import { PluginFileTree } from './PluginFileTree';
import { PluginNewFileDialog } from './PluginNewFileDialog';
import { PluginRemoveDrawer } from './PluginRemoveDrawer';

const BUMPS: PluginBump[] = ['patch', 'minor', 'major'];

/** Details of one plugin as page: activate/deactivate, deploy, code, download, delete. */
export const PluginDetailPage: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { loading, error, plugins, reload } = usePluginList();
  const plugin = plugins.find(item => item.pluginId === pluginId) ?? null;
  const status = usePluginStatus(() => void reload());
  const deployment = usePluginDeploy(() => void reload());
  const building = usePluginBuild();
  const removal = usePluginRemove(() => undefined);
  const [deployOpen, setDeployOpen] = useState(false);
  const [bump, setBump] = useState<PluginBump>('patch');
  const [deploying, setDeploying] = useState(false);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [newFileOpen, setNewFileOpen] = useState(false);
  const [treeKey, setTreeKey] = useState(0);
  const [removeOpen, setRemoveOpen] = useState(false);
  const busy = status.pending !== null || deploying || removal.busy || building.busy;
  const active = plugin?.status === 'active';

  const toggle = async (value: boolean) => {
    if (!plugin) return;
    const result = await status.setStatus(plugin.pluginId, value);
    if (result.success) {
      toast.success(
        t(value ? 'plugins.toggle.activated' : 'plugins.toggle.deactivated', { name: plugin.name })
      );
    } else {
      toast.error(
        result.error === 'app_version_too_old'
          ? t('plugins.toggle.appVersionTooOld')
          : t('plugins.toggle.error')
      );
    }
  };

  const build = async () => {
    if (!plugin) return;
    const result = await building.build(plugin.pluginId);
    if (result.success) {
      toast.success(
        t(result.synced ? 'plugins.build.synced' : 'plugins.build.success', { name: plugin.name })
      );
    } else {
      toast.error(
        t(`plugins.build.errors.${result.error ?? 'unknown'}`, {
          defaultValue: t('plugins.build.errors.unknown'),
        }),
        { description: result.errors?.join('\n') || undefined }
      );
    }
  };

  const deploy = async (bump: PluginBump) => {
    if (!plugin) return;
    setDeploying(true);
    const result = await deployment.deploy(plugin.pluginId, bump);
    setDeploying(false);
    setDeployOpen(false);
    if (result.success) {
      toast.success(
        t('plugins.deploy.success', { name: plugin.name, version: result.plugin?.version ?? plugin.version })
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

  const download = async (item: IPluginListItem) => {
    const result = await PluginApi.download(item.pluginId);
    if (result.success && result.filename && result.data) {
      saveZip(result.filename, result.data);
    } else {
      toast.error(
        t(`plugins.download.errors.${result.error ?? 'unknown'}`, {
          defaultValue: t('plugins.download.errors.unknown'),
        })
      );
    }
  };

  const confirmRemove = async (item: IPluginListItem) => {
    const result = await removal.remove(item.pluginId);
    if (result.success) {
      toast.success(t('plugins.remove.success', { name: item.name }));
      setRemoveOpen(false);
      void navigate({ to: ADMIN_PLUGINS_ROUTE });
    } else {
      toast.error(
        t(`plugins.remove.errors.${result.error ?? 'unknown'}`, {
          defaultValue: t('plugins.remove.errors.unknown'),
        })
      );
    }
  };

  const back = (
    <Link
      to={ADMIN_PLUGINS_ROUTE}
      aria-label={t('plugins.details.back')}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent"
    >
      <ArrowLeft className="size-5" />
    </Link>
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-3" aria-busy="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !plugin) {
    return (
      <div className="flex flex-col">
        <header className="flex items-center gap-2 px-2 pt-3 pb-3">{back}</header>
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {error ? t('plugins.error.title') : t('plugins.details.notFound')}
            </EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            {error && (
              <Button variant="outline" size="lg" onClick={reload}>
                {t('plugins.error.retry')}
              </Button>
            )}
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full flex-col bg-background">
      <header className="flex items-center gap-2 px-2 pt-3 pb-3">
        {back}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{plugin.name}</h1>
          <p className="truncate font-mono text-caption text-muted-foreground">{plugin.pluginId}</p>
        </div>
      </header>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-border px-4 py-3 text-body">
        <dt className="text-muted-foreground">{t('plugins.details.version')}</dt>
        <dd className="font-mono">{plugin.version}</dd>
        <dt className="text-muted-foreground">{t('plugins.details.minAppVersion')}</dt>
        <dd className="font-mono">{plugin.minAppVersion}</dd>
        <dt className="text-muted-foreground">{t('plugins.details.state')}</dt>
        <dd>
          {t(`plugins.status.${plugin.status}`)}
          {plugin.development && ` · ${t('plugins.status.inDevelopment')}`}
        </dd>
      </dl>

      <div className="flex flex-col gap-4 px-4 py-4">
        <label className="flex min-h-12 items-center justify-between gap-3">
          <span className="text-body font-medium">{t('plugins.details.active')}</span>
          <Switch
            checked={active}
            disabled={busy}
            onCheckedChange={value => void toggle(value)}
            aria-label={t('plugins.toggle.label', { name: plugin.name })}
          />
        </label>

        {plugin.development && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-body font-bold">{t('plugins.code.files')}</h2>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => setNewFileOpen(true)}>
                <FilePlus className="size-4" />
                {t('plugins.code.newFile')}
              </Button>
            </div>
            <PluginFileTree
              pluginId={plugin.pluginId}
              reloadKey={treeKey}
              onOpenFile={setEditPath}
            />
          </section>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {plugin.development && (
            <Button variant="outline" size="lg" disabled={busy} onClick={() => void build()}>
              <Hammer className="size-4" />
              {t('plugins.details.build')}
            </Button>
          )}

          {plugin.development && (
            <Button variant="outline" size="lg" disabled={busy} onClick={() => setDeployOpen(true)}>
              <Rocket className="size-4" />
              {t('plugins.details.deploy')}
            </Button>
          )}

          <Button variant="outline" size="lg" disabled={busy} onClick={() => void download(plugin)}>
            <Download className="size-4" />
            {t('plugins.details.download')}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="text-destructive hover:text-destructive"
            disabled={busy || active}
            title={active ? t('plugins.remove.activeHint') : undefined}
            onClick={() => setRemoveOpen(true)}
          >
            <Trash2 className="size-4" />
            {t('plugins.details.remove')}
          </Button>
        </div>
        {active && (
          <p className="text-caption text-muted-foreground">{t('plugins.remove.activeHint')}</p>
        )}

      </div>

      {plugin.development && (
        <Dialog open={deployOpen} onOpenChange={open => !busy && setDeployOpen(open)}>
          <DialogContent className="flex flex-col gap-4">
            <DialogHeader className="text-left">
              <DialogTitle>{t('plugins.deploy.dialogTitle', { name: plugin.name })}</DialogTitle>
              <DialogDescription>
                {t('plugins.deploy.dialogDescription', { version: plugin.version })}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <span className="text-caption font-medium">{t('plugins.deploy.versionLabel')}</span>
              <Select value={bump} onValueChange={value => setBump(value as PluginBump)}>
                <SelectTrigger className="h-12 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUMPS.map(item => (
                    <SelectItem key={item} value={item}>
                      {`${t(`plugins.deploy.bump.${item}`)} · ${bumpVersion(plugin.version, item)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" size="lg" disabled={busy} onClick={() => setDeployOpen(false)}>
                {t('plugins.deploy.cancel')}
              </Button>
              <Button
                size="lg"
                disabled={busy}
                onClick={async () => {
                  await deploy(bump);
                  setDeployOpen(false);
                }}
              >
                {busy ? t('plugins.deploy.busy') : t('plugins.deploy.start')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {plugin.development && (
        <PluginNewFileDialog
          pluginId={plugin.pluginId}
          open={newFileOpen}
          onOpenChange={setNewFileOpen}
          onCreated={path => {
            setTreeKey(key => key + 1);
            setEditPath(path);
          }}
        />
      )}

      {plugin.development && (
        <PluginFileEditorDialog
          pluginId={plugin.pluginId}
          pluginName={plugin.name}
          path={editPath}
          onClose={() => setEditPath(null)}
        />
      )}

      <PluginRemoveDrawer
        plugin={removeOpen ? plugin : null}
        busy={removal.busy}
        onOpenChange={open => !open && setRemoveOpen(false)}
        onConfirm={confirmRemove}
      />
    </div>
  );
};
