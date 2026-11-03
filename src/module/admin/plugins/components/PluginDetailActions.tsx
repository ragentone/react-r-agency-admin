import { Button } from '@ui/shad-cn/components/button.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Download, Hammer, Rocket, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginDetail } from '../hooks/use-plugin-detail';
import type { IPluginListItem } from '../types';

interface IPluginDetailActionsProps {
  plugin: IPluginListItem;
  detail: PluginDetail;
  onDeploy: () => void;
  onRemove: () => void;
}

/** Activation switch and the action buttons. Build and deploy only for development plugins. */
export const PluginDetailActions: React.FC<IPluginDetailActionsProps> = ({ plugin, detail, onDeploy, onRemove }) => {
  const { t } = useTranslation('admin');

  return (
    <>
      <label className="flex min-h-12 items-center justify-between gap-3">
        <span className="text-body font-medium">{t('plugins.details.active')}</span>
        <Switch
          checked={detail.active}
          disabled={detail.busy}
          onCheckedChange={value => void detail.toggle(value)}
          aria-label={t('plugins.toggle.label', { name: plugin.name })}
        />
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {plugin.development && (
          <Button variant="outline" size="lg" disabled={detail.busy} onClick={() => void detail.build()}>
            <Hammer className="size-4" />
            {t('plugins.details.build')}
          </Button>
        )}
        {plugin.development && (
          <Button variant="outline" size="lg" disabled={detail.busy} onClick={onDeploy}>
            <Rocket className="size-4" />
            {t('plugins.details.deploy')}
          </Button>
        )}
        <Button variant="outline" size="lg" disabled={detail.busy} onClick={() => void detail.download()}>
          <Download className="size-4" />
          {t('plugins.details.download')}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="text-destructive hover:text-destructive"
          disabled={detail.busy || detail.active}
          title={detail.active ? t('plugins.remove.activeHint') : undefined}
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
          {t('plugins.details.remove')}
        </Button>
      </div>

      {detail.active && <p className="text-caption text-muted-foreground">{t('plugins.remove.activeHint')}</p>}
    </>
  );
};
