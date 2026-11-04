import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ADMIN_PLUGINS_ROUTE } from '../../const';
import { PluginApi } from '../api';
import { saveZip } from '../download';
import type { IPluginListItem, PluginScope } from '../types';
import { type PluginBump } from '../version';
import { usePluginBuild } from './use-plugin-build';
import { usePluginDeploy } from './use-plugin-deploy';
import { usePluginPurge } from './use-plugin-purge';
import { usePluginRemove } from './use-plugin-remove';
import { usePluginStatus } from './use-plugin-status';

/** Actions of one plugin on its details page. `busy` locks every action while one of them runs. */
export const usePluginDetail = (plugin: IPluginListItem, reload: () => void) => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const status = usePluginStatus(() => void reload());
  const deployment = usePluginDeploy(() => void reload());
  const building = usePluginBuild();
  const removal = usePluginRemove(() => undefined);
  const purgeData = usePluginPurge();
  const [deploying, setDeploying] = useState(false);
  const busy = status.pending !== null || deploying || removal.busy || building.busy || purgeData.busy;

  const toggle = async (value: boolean) => {
    const result = await status.setStatus(plugin.pluginId, value);
    if (result.success) {
      toast.success(t(value ? 'plugins.toggle.activated' : 'plugins.toggle.deactivated', { name: plugin.name }));
    } else {
      toast.error(
        result.error === 'app_version_too_old' ? t('plugins.toggle.appVersionTooOld') : t('plugins.toggle.error')
      );
    }
  };

  const build = async () => {
    const result = await building.build(plugin.pluginId);
    if (result.success) {
      toast.success(t(result.synced ? 'plugins.build.synced' : 'plugins.build.success', { name: plugin.name }));
    } else {
      toast.error(
        t(`plugins.build.errors.${result.error ?? 'unknown'}`, { defaultValue: t('plugins.build.errors.unknown') }),
        { description: result.errors?.join('\n') || undefined }
      );
    }
  };

  const deploy = async (bump: PluginBump) => {
    setDeploying(true);
    const result = await deployment.deploy(plugin.pluginId, bump);
    setDeploying(false);
    if (result.success) {
      toast.success(t('plugins.deploy.success', { name: plugin.name, version: result.plugin?.version ?? plugin.version }));
    } else {
      toast.error(
        t(`plugins.deploy.errors.${result.error ?? 'unknown'}`, { defaultValue: t('plugins.deploy.errors.unknown') }),
        { description: result.errors?.join('\n') || undefined }
      );
    }
  };

  /** Deletes the stored data of this (inactive) plugin. Returns `true` on success. */
  const purge = async (): Promise<boolean> => {
    const result = await purgeData.purge(plugin.pluginId);
    if (result.success) {
      toast.success(t('plugins.purge.success', { name: plugin.name, count: result.deleted ?? 0 }));
      return true;
    }
    toast.error(t(`plugins.purge.errors.${result.error ?? 'unknown'}`, { defaultValue: t('plugins.purge.errors.unknown') }));
    return false;
  };

  const download = async () => {
    const result = await PluginApi.download(plugin.pluginId);
    if (result.success && result.filename && result.data) {
      saveZip(result.filename, result.data);
    } else {
      toast.error(t(`plugins.download.errors.${result.error ?? 'unknown'}`, { defaultValue: t('plugins.download.errors.unknown') }));
    }
  };

  /** Deletes the plugin. With `withData` its stored data is deleted as well. */
  const remove = async (withData: boolean) => {
    const result = await removal.remove(plugin.pluginId);
    if (result.success) {
      if (withData) {
        const purged = await purgeData.purge(plugin.pluginId);
        if (!purged.success) {
          toast.error(t(`plugins.purge.errors.${purged.error ?? 'unknown'}`, { defaultValue: t('plugins.purge.errors.unknown') }));
        }
      }
      toast.success(t('plugins.remove.success', { name: plugin.name }));
      void navigate({ to: ADMIN_PLUGINS_ROUTE });
    } else {
      toast.error(t(`plugins.remove.errors.${result.error ?? 'unknown'}`, { defaultValue: t('plugins.remove.errors.unknown') }));
    }
  };

  /** Changes where the plugin runs. Returns `true` on success. */
  const changeScope = async (scope: PluginScope[]): Promise<boolean> => {
    const result = await PluginApi.setScope(plugin.pluginId, scope);
    if (result.success) {
      toast.success(t('plugins.scope.saved', { name: plugin.name }));
      void reload();
      return true;
    }
    toast.error(t(`plugins.scope.errors.${result.error ?? 'unknown'}`, { defaultValue: t('plugins.scope.errors.unknown') }));
    return false;
  };

  return {
    busy,
    changeScope,
    active: plugin.status === 'active',
    removeBusy: removal.busy,
    purgeBusy: purgeData.busy,
    purge,
    toggle,
    build,
    deploy,
    download,
    remove,
  };
};

export type PluginDetail = ReturnType<typeof usePluginDetail>;
