import { Switch } from '@ui/shad-cn/components/switch.tsx';
import { Package } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';

interface IPluginRowProps {
  plugin: IPluginListItem;
  pending: boolean;
  onToggle: (active: boolean) => void;
}

/** One installed plugin: name, id and version, status and the activation switch. */
export const PluginRow: React.FC<IPluginRowProps> = ({ plugin, pending, onToggle }) => {
  const { t } = useTranslation('admin');
  const active = plugin.status === 'active';

  return (
    <li className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Package className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-bold text-foreground">{plugin.name}</p>
        <p className="truncate text-caption text-muted-foreground">
          {plugin.pluginId} · {plugin.version} · {t(`plugins.status.${plugin.status}`)}
        </p>
      </div>
      <Switch
        checked={active}
        disabled={pending}
        onCheckedChange={onToggle}
        aria-label={t('plugins.toggle.label', { name: plugin.name })}
      />
    </li>
  );
};
