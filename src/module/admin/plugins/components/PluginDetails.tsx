import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@ui/shad-cn/components/collapsible.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { ChevronDown, Download, Rocket, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';
import { bumpVersion, type PluginBump } from '../version';

interface IPluginDetailsProps {
  open: boolean;
  plugin: IPluginListItem | null;
  /** True while an action on any plugin runs. */
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (plugin: IPluginListItem, active: boolean) => void;
  /** Resolves when the deploy has finished; the drawer stays open meanwhile. */
  onDeploy: (plugin: IPluginListItem, bump: PluginBump) => Promise<void>;
  onRemove: (plugin: IPluginListItem) => void;
  onDownload: (plugin: IPluginListItem) => void;
}

const BUMPS: PluginBump[] = ['patch', 'minor', 'major'];

/**
 * Details of one plugin with all actions: activate/deactivate, deploy (development), delete.
 * „Neu deployen“ expands the version choice below it.
 */
export const PluginDetails: React.FC<IPluginDetailsProps> = ({
  open,
  plugin,
  pending,
  onOpenChange,
  onToggle,
  onDeploy,
  onRemove,
  onDownload,
}) => {
  const { t } = useTranslation('admin');
  const [deployOpen, setDeployOpen] = useState(false);
  const active = plugin?.status === 'active';

  const handleOpenChange = (next: boolean) => {
    if (!next) setDeployOpen(false);
    onOpenChange(next);
  };

  const choose = async (bump: PluginBump) => {
    if (!plugin) return;
    await onDeploy(plugin, bump);
    setDeployOpen(false);
  };

  return (
    <AppDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title={plugin?.name ?? ''}
      description={plugin?.pluginId}
      size="auto"
      locked={pending}
    >
      {plugin && (
        <div className="flex flex-col">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-b border-border px-4 py-3 text-body">
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
                disabled={pending}
                onCheckedChange={value => onToggle(plugin, value)}
                aria-label={t('plugins.toggle.label', { name: plugin.name })}
              />
            </label>

            {plugin.development && (
              <Collapsible open={deployOpen} onOpenChange={setDeployOpen}>
                <CollapsibleTrigger
                  render={
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-between"
                      disabled={pending}
                    />
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
                      onClick={() => void choose(bump)}
                    >
                      <span>{t(`plugins.deploy.bump.${bump}`)}</span>
                      <span className="font-mono text-caption">
                        {bumpVersion(plugin.version, bump)}
                      </span>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            <Button variant="outline" size="lg" onClick={() => onDownload(plugin)}>
              <Download className="size-4" />
              {t('plugins.details.download')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="text-destructive hover:text-destructive"
              disabled={pending || active}
              title={active ? t('plugins.remove.activeHint') : undefined}
              onClick={() => onRemove(plugin)}
            >
              <Trash2 className="size-4" />
              {t('plugins.details.remove')}
            </Button>
            {active && (
              <p className="text-caption text-muted-foreground">{t('plugins.remove.activeHint')}</p>
            )}
          </div>
        </div>
      )}
    </AppDrawer>
  );
};
