import { AppFormDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePluginConfig } from '../hooks/use-plugin-config';
import type { IPluginListItem } from '../types';
import { PluginConfigBody } from './PluginConfigBody';

interface IPluginConfigDrawerProps {
  open: boolean;
  plugin: IPluginListItem;
  onOpenChange: (open: boolean) => void;
}

/** Drawer with the configuration form of one plugin. Loads the schema when it opens. */
export const PluginConfigDrawer: React.FC<IPluginConfigDrawerProps> = ({
  open,
  plugin,
  onOpenChange,
}) => {
  const { t } = useTranslation('admin');
  const config = usePluginConfig(plugin.pluginId, open);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!config.dirty) return;
    if (await config.save()) {
      toast.success(t('plugins.config.saved', { name: plugin.name }));
    }
  };

  const close = (next: boolean) => {
    if (config.saving) return;
    onOpenChange(next);
  };

  return (
    <AppFormDrawer
      open={open}
      onOpenChange={close}
      title={t('plugins.config.title', { name: plugin.name })}
      description={t('plugins.config.description')}
      onSubmit={submit}
      submitLabel={config.saving ? t('plugins.config.busy') : t('plugins.config.save')}
      submitDisabled={!config.dirty || config.loading || config.loadError !== null}
      busy={config.saving}
      locked={config.saving}
      secondaryAction={
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={config.loading || config.saving || config.fields.length === 0}
          onClick={config.resetAll}
        >
          {t('plugins.config.resetAll')}
        </Button>
      }
    >
      <PluginConfigBody config={config} />
    </AppFormDrawer>
  );
};
