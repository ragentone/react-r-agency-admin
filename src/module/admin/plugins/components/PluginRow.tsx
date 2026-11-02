import { Link } from '@tanstack/react-router';
import { ChevronRight, Package } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { adminPluginPath } from '../../const';
import type { IPluginListItem } from '../types';

interface IPluginRowProps {
  plugin: IPluginListItem;
}

/** One installed plugin in the list. Tapping it opens the plugin page. */
export const PluginRow: React.FC<IPluginRowProps> = ({ plugin }) => {
  const { t } = useTranslation('admin');

  return (
    <li className="border-b border-border">
      <Link
        to={adminPluginPath(plugin.pluginId)}
        aria-label={t('plugins.details.open', { name: plugin.name })}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Package className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-bold text-foreground">{plugin.name}</p>
          <p className="truncate text-caption text-muted-foreground">
            {plugin.pluginId} · {plugin.version} · {t(`plugins.status.${plugin.status}`)}
            {plugin.development && ` · ${t('plugins.status.inDevelopment')}`}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </Link>
    </li>
  );
};
