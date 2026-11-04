import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';

interface IPluginPurgeDrawerProps {
  plugin: IPluginListItem | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (plugin: IPluginListItem) => void;
}

/** Confirmation before the stored data of an inactive plugin is deleted. The plugin itself stays. */
export const PluginPurgeDrawer: React.FC<IPluginPurgeDrawerProps> = ({
  plugin,
  busy,
  onOpenChange,
  onConfirm,
}) => {
  const { t } = useTranslation('admin');

  return (
    <AppDrawer
      open={plugin !== null}
      onOpenChange={onOpenChange}
      title={t('plugins.purge.title', { name: plugin?.name ?? '' })}
      description={t('plugins.purge.description')}
      size="auto"
      locked={busy}
    >
      <div className="flex flex-col gap-2 px-4 py-4">
        <Button
          variant="destructive"
          size="lg"
          disabled={busy || !plugin}
          onClick={() => plugin && onConfirm(plugin)}
        >
          {busy ? t('plugins.purge.busy') : t('plugins.purge.confirm')}
        </Button>
        <Button variant="ghost" size="lg" disabled={busy} onClick={() => onOpenChange(false)}>
          {t('plugins.purge.cancel')}
        </Button>
      </div>
    </AppDrawer>
  );
};
