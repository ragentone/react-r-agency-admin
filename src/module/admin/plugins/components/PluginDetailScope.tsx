import { Button } from '@ui/shad-cn/components/button.tsx';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@ui/shad-cn/components/item.tsx';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PluginDetail } from '../hooks/use-plugin-detail';
import type { IPluginListItem } from '../types';
import { PluginScopeDrawer } from './PluginScopeDrawer';

interface IPluginDetailScopeProps {
  plugin: IPluginListItem;
  detail: PluginDetail;
}

/** Where the plugin runs, as a list item above the tabs. Changing it opens a drawer. */
export const PluginDetailScope: React.FC<IPluginDetailScopeProps> = ({ plugin, detail }) => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const labels = plugin.scope.map(item => t(`plugins.create.scope.${item}`)).join(' · ');
  const locked = plugin.scopeProtected === true;

  return (
    <>
      <Item variant="outline" size="sm">
        <ItemContent>
          <ItemTitle>{t('plugins.scope.title')}</ItemTitle>
          <ItemDescription>{labels}</ItemDescription>
          {locked && <ItemDescription>{t('plugins.scope.locked')}</ItemDescription>}
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" disabled={detail.busy || locked} onClick={() => setOpen(true)}>
            {t('plugins.scope.change')}
          </Button>
        </ItemActions>
      </Item>
      <PluginScopeDrawer open={open} onOpenChange={setOpen} plugin={plugin} onSave={detail.changeScope} />
    </>
  );
};
