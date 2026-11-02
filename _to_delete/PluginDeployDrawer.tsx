import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';
import { bumpVersion, type PluginBump } from '../version';

interface IPluginDeployDrawerProps {
  plugin: IPluginListItem | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (plugin: IPluginListItem, bump: PluginBump) => void;
}

const BUMPS: PluginBump[] = ['patch', 'minor', 'major'];

/** Asks which part of the version to raise before a development plugin is built and deployed. */
export const PluginDeployDrawer: React.FC<IPluginDeployDrawerProps> = ({
  plugin,
  busy,
  onOpenChange,
  onChoose,
}) => {
  const { t } = useTranslation('admin');

  return (
    <AppDrawer
      open={plugin !== null}
      onOpenChange={onOpenChange}
      title={t('plugins.deploy.dialogTitle', { name: plugin?.name ?? '' })}
      description={t('plugins.deploy.dialogDescription', { version: plugin?.version ?? '' })}
      size="auto"
      locked={busy}
    >
      <div className="flex flex-col gap-2 px-4 py-4">
        {BUMPS.map(bump => (
          <Button
            key={bump}
            variant="outline"
            size="lg"
            className="h-auto min-h-12 justify-between whitespace-normal py-3 text-left"
            disabled={busy || !plugin}
            onClick={() => plugin && onChoose(plugin, bump)}
          >
            <span>{t(`plugins.deploy.bump.${bump}`)}</span>
            <span className="font-mono text-caption">
              {bumpVersion(plugin?.version ?? '0.0.0', bump)}
            </span>
          </Button>
        ))}
        <Button variant="ghost" size="lg" disabled={busy} onClick={() => onOpenChange(false)}>
          {t('plugins.deploy.cancel')}
        </Button>
      </div>
    </AppDrawer>
  );
};
