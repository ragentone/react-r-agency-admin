import {
  DataList,
  DataListItem,
  DataListItemLabel,
  DataListItemValue,
} from '@ui/shad-cn/components/data-list.tsx';
import { Status } from '@ui/shad-cn/components/status.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';
import { PluginStatusBadge } from './PluginStatusBadge';

/** Version, minimum app version and status of a plugin. */
export const PluginDetailInfo: React.FC<{ plugin: IPluginListItem }> = ({ plugin }) => {
  const { t } = useTranslation('admin');

  return (
    <div className={'p-4 w-full'}>
      <DataList className={'w-full border border-border/50 rounded-xl p-4 divide-y'}>
        <DataListItem>
          <DataListItemLabel>{t('plugins.details.version')}</DataListItemLabel>
          <DataListItemValue>
            <Status variant={'info'}>{plugin.version}</Status>
          </DataListItemValue>
        </DataListItem>
        <DataListItem>
          <DataListItemLabel>{t('plugins.details.minAppVersion')}</DataListItemLabel>
          <DataListItemValue>
            <Status variant={'success'}>{plugin.minAppVersion}</Status>
          </DataListItemValue>
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
    </div>
  );
};
