import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ui/shad-cn/components/collapsible.tsx';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { ArrowLeft, ChevronDown, Download, Rocket, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ADMIN_PLUGINS_ROUTE } from '../../const';
import { PluginApi } from '../api';
import { saveZip } from '../download';
import { usePluginDeploy } from '../hooks/use-plugin-deploy';
import { usePluginList } from '../hooks/use-plugin-list';
import { usePluginRemove } from '../hooks/use-plugin-remove';
import { usePluginStatus } from '../hooks/use-plugin-status';
import type { IPluginListItem } from '../types';
import { bumpVersion, type PluginBump } from '../version';
import { PluginFileEditorDialog } from './PluginFileEditorDialog';
import { PluginFileTree } from './PluginFileTree';
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
  const removal = usePluginRemove(() => undefined);
  const [deployOpen, setDeployOpen] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);
  const busy = status.pending !== null || deploying || removal.busy;
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

      <div className="flex flex-col gap-3 px-4 py-4">
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
          <Collapsible open={deployOpen} onOpenChange={setDeployOpen}>
            <CollapsibleTrigger
              render={
                <Button variant="outline" size="lg" className="w-full justify-between" disabled={busy} />
              }
            >
              <span className="flex items-center gap-2">
                <Rocket className="size-4" />
                {t('plugins.details.deploy')}
              </span>
              <ChevronDown
                className={`size-4 transition-transform ${deployOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-2 pt-2">
              {BUMPS.map(bump => (
                <Button
                  key={bump}
                  variant="outline"
                  size="lg"
                  className="h-auto min-h-12 justify-between whitespace-normal py-3 text-left"
                  disabled={busy}
                  onClick={() => void deploy(bump)}
                >
                  <span>{t(`plugins.deploy.bump.${bump}`)}</span>
                  <span className="font-mono text-caption">{bumpVersion(plugin.version, bump)}</span>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {plugin.development && (
          <section className="flex flex-col gap-2">
            <h2 className="text-body font-bold">{t('plugins.code.files')}</h2>
            <PluginFileTree pluginId={plugin.pluginId} onOpenFile={setEditPath} />
          </section>
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
        {active && (
          <p className="text-caption text-muted-foreground">{t('plugins.remove.activeHint')}</p>
        )}
      </div>

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
