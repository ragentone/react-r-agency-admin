import {
  DataList,
  DataListItem,
  DataListItemLabel,
  DataListItemValue,
} from '@ui/shad-cn/components/data-list.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';
import { PluginStatusBadge } from './PluginStatusBadge';

/** Version, minimum app version and status of a plugin. */
export const PluginDetailInfo: React.FC<{ plugin: IPluginListItem }> = ({ plugin }) => {
  const { t } = useTranslation('admin');

  return (
    <DataList>
      <DataListItem>
        <DataListItemLabel>{t('plugins.details.version')}</DataListItemLabel>
        <DataListItemValue>{plugin.version}</DataListItemValue>
      </DataListItem>
      <DataListItem>
        <DataListItemLabel>{t('plugins.details.minAppVersion')}</DataListItemLabel>
        <DataListItemValue>{plugin.minAppVersion}</DataListItemValue>
      </DataListItem>
      <DataListItem>
        <DataListItemLabel>{t('plugins.details.state')}</DataListItemLabel>
        <DataListItemValue className={'flex gap-2 items-center'}>
          {plugin.development && (
            <span className="text-caption text-muted-foreground">
              {t('plugins.status.inDevelopment')}
            </span>
          )}
          <PluginStatusBadge status={plugin.status} />
        </DataListItemValue>
      </DataListItem>
    </DataList>
  );
};
