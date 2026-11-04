import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Database, Download, Hammer, Rocket, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginDetail } from '../hooks/use-plugin-detail';
import type { IPluginListItem } from '../types';

interface IPluginDetailActionsProps {
  plugin: IPluginListItem;
  detail: PluginDetail;
  onDeploy: () => void;
  onRemove: () => void;
  onPurge: () => void;
}

/** Activation switch and the action buttons. Build and deploy only for development plugins. */
export const PluginDetailActions: React.FC<IPluginDetailActionsProps> = ({
  plugin,
  detail,
  onDeploy,
  onRemove,
  onPurge,
}) => {
  const { t } = useTranslation('admin');

  return (
    <>
      <div className="flex flex-col gap-2">
        <Item variant={'outline'} className={'rounded-4xl shadow-xs'} size={'sm'}>
          <ItemContent>
            <ItemTitle>{t('plugins.details.active')}</ItemTitle>
            <ItemDescription>{t('plugins.remove.activeHint')}</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch
              checked={detail.active}
              disabled={detail.busy}
              onCheckedChange={value => void detail.toggle(value)}
              aria-label={t('plugins.toggle.label', { name: plugin.name })}
            />
          </ItemActions>
        </Item>

        {plugin.development && (
          <Button
            variant="outline"
            size="lg"
            disabled={detail.busy}
            onClick={() => void detail.build()}
          >
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
        <Button
          variant="outline"
          size="lg"
          disabled={detail.busy}
          onClick={() => void detail.download()}
        >
          <Download className="size-4" />
          {t('plugins.details.download')}
        </Button>
        {!detail.active && (
          <Button variant="outline" size="lg" disabled={detail.busy} onClick={onPurge}>
            <Database className="size-4" />
            {t('plugins.purge.button')}
          </Button>
        )}
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
    </>
  );
};
