import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@ui/shad-cn/components/item.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginDetail } from '../hooks/use-plugin-detail';
import type { IPluginListItem } from '../types';

interface IPluginDetailActivationProps {
  plugin: IPluginListItem;
  detail: PluginDetail;
}

/** Activation switch of a plugin, as a list item above the tabs. */
export const PluginDetailActivation: React.FC<IPluginDetailActivationProps> = ({ plugin, detail }) => {
  const { t } = useTranslation('admin');

  return (
    <Item variant="outline" size="sm">
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
  );
};
