import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';
import { PluginStatusBadge } from './PluginStatusBadge';

/** Version, minimum app version and status of a plugin. */
export const PluginDetailInfo: React.FC<{ plugin: IPluginListItem }> = ({ plugin }) => {
  const { t } = useTranslation('admin');

  return (
    <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 border-b border-border px-4 py-4 text-body">
      <dt className="text-caption text-muted-foreground">{t('plugins.details.version')}</dt>
      <dd className="font-mono">{plugin.version}</dd>
      <dt className="text-caption text-muted-foreground">{t('plugins.details.minAppVersion')}</dt>
      <dd className="font-mono">{plugin.minAppVersion}</dd>
      <dt className="text-caption text-muted-foreground">{t('plugins.details.state')}</dt>
      <dd className="flex flex-wrap items-center gap-2">
        <PluginStatusBadge status={plugin.status} />
        {plugin.development && (
          <span className="text-caption text-muted-foreground">{t('plugins.status.inDevelopment')}</span>
        )}
      </dd>
    </dl>
  );
};
