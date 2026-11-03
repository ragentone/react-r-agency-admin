import { Link } from '@tanstack/react-router';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@ui/shad-cn/components/item.tsx';
import { ChevronRight, Package } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { adminPluginPath } from '../../const';
import type { IPluginListItem } from '../types';
import { PluginStatusBadge } from './PluginStatusBadge';

interface IPluginRowProps {
  plugin: IPluginListItem;
}

/** One installed plugin. The whole row is the link to its page. */
export const PluginRow: React.FC<IPluginRowProps> = ({ plugin }) => {
  const { t } = useTranslation('admin');

  return (
    <li className="border-b border-border">
      <Item asChild size="sm">
        <Link
          to={adminPluginPath(plugin.pluginId)}
          aria-label={t('plugins.details.open', { name: plugin.name })}
          className="min-h-14 transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ItemMedia variant="icon">
            <Package aria-hidden="true" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{plugin.name}</ItemTitle>
            <ItemDescription className="truncate">
              {plugin.pluginId} · {plugin.version}
              {plugin.development && ` · ${t('plugins.status.inDevelopment')}`}
            </ItemDescription>
          </ItemContent>
          <PluginStatusBadge status={plugin.status} />
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      </Item>
    </li>
  );
};
