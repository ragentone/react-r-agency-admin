import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginUnknownItem } from '../types';

interface IPluginUnknownRemoveDrawerProps {
  plugin: IPluginUnknownItem | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (plugin: IPluginUnknownItem) => void;
}

/** Confirmation before the files of an unknown plugin folder are deleted. Deletion is final. */
export const PluginUnknownRemoveDrawer: React.FC<IPluginUnknownRemoveDrawerProps> = ({
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
      title={t('plugins.unknown.removeTitle', { name: plugin?.name ?? '' })}
      description={t('plugins.unknown.removeDescription')}
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
          {busy ? t('plugins.unknown.removeBusy') : t('plugins.unknown.removeConfirm')}
        </Button>
        <Button variant="ghost" size="lg" disabled={busy} onClick={() => onOpenChange(false)}>
          {t('plugins.remove.cancel')}
        </Button>
      </div>
    </AppDrawer>
  );
};
