import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';

interface IPluginRemoveDrawerProps {
  plugin: IPluginListItem | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (plugin: IPluginListItem) => void;
}

/** Confirmation before a plugin is deleted. Deletion is final, so it is always asked for. */
export const PluginRemoveDrawer: React.FC<IPluginRemoveDrawerProps> = ({
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
      title={t('plugins.remove.title', { name: plugin?.name ?? '' })}
      description={t('plugins.remove.description')}
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
          {busy ? t('plugins.remove.busy') : t('plugins.remove.confirm')}
        </Button>
        <Button variant="ghost" size="lg" disabled={busy} onClick={() => onOpenChange(false)}>
          {t('plugins.remove.cancel')}
        </Button>
      </div>
    </AppDrawer>
  );
};
