import { AppFormDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';
import { bumpVersion, type PluginBump } from '../version';

const BUMPS: PluginBump[] = ['patch', 'minor', 'major'];

interface IPluginDeployDrawerProps {
  open: boolean;
  plugin: IPluginListItem;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onDeploy: (bump: PluginBump) => void | Promise<void>;
}

/** Choose patch, minor or major and deploy the development project. */
export const PluginDeployDrawer: React.FC<IPluginDeployDrawerProps> = ({
  open,
  plugin,
  busy,
  onOpenChange,
  onDeploy,
}) => {
  const { t } = useTranslation('admin');
  const [bump, setBump] = useState<PluginBump>('minor');

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={next => !busy && onOpenChange(next)}
      autoHeight={true}
      title={t('plugins.deploy.dialogTitle', { name: plugin.name })}
      description={t('plugins.deploy.dialogDescription', { version: plugin.version })}
      onSubmit={event => {
        event.preventDefault();
        void onDeploy(bump);
      }}
      submitLabel={busy ? t('plugins.deploy.busy') : t('plugins.deploy.start')}
      busy={busy}
      locked={busy}
      secondaryAction={
        <Button variant="ghost" size="lg" disabled={busy} onClick={() => onOpenChange(false)}>
          {t('plugins.deploy.cancel')}
        </Button>
      }
    >
      <div className="flex flex-col gap-2 px-4 py-4">
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
    </AppFormDrawer>
  );
};
