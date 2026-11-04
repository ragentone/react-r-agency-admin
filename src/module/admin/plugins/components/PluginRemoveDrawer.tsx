import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';

interface IPluginRemoveDrawerProps {
  plugin: IPluginListItem | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  /** `withData`: also delete the stored data of the plugin. */
  onConfirm: (plugin: IPluginListItem, withData: boolean) => void;
}

/** Confirmation before a plugin is deleted. Deletion is final, so it is always asked for. */
export const PluginRemoveDrawer: React.FC<IPluginRemoveDrawerProps> = ({
  plugin,
  busy,
  onOpenChange,
  onConfirm,
}) => {
  const { t } = useTranslation('admin');
  const [withData, setWithData] = useState(false);

  useEffect(() => setWithData(false), [plugin?.pluginId]);

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
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/60 p-4 select-none">
          <Checkbox
            checked={withData}
            disabled={busy}
            onCheckedChange={value => setWithData(value === true)}
            className="mt-0.5"
          />
          <span className="text-body leading-5 font-medium">{t('plugins.remove.withData')}</span>
        </label>
        <Button
          variant="destructive"
          size="lg"
          disabled={busy || !plugin}
          onClick={() => plugin && onConfirm(plugin, withData)}
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
