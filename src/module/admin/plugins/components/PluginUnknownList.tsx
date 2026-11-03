import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { Status, StatusLabel } from '@ui/shad-cn/components/status.tsx';
import { Download, FolderOpen, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginUnknownItem } from '../types';
import { PluginEmpty, PluginListError, PluginListLoading } from './PluginStates';

interface IPluginUnknownListProps {
  loading: boolean;
  error: boolean;
  plugins: IPluginUnknownItem[];
  busy: boolean;
  onRetry: () => void;
  onInstall: (plugin: IPluginUnknownItem) => void;
  onRemove: (plugin: IPluginUnknownItem) => void;
}

interface IUnknownRowProps {
  plugin: IPluginUnknownItem;
  busy: boolean;
  onInstall: (plugin: IPluginUnknownItem) => void;
  onRemove: (plugin: IPluginUnknownItem) => void;
}

/** One folder without registry entry: its facts, why it cannot be installed (if so), and its actions. */
const UnknownRow: React.FC<IUnknownRowProps> = ({ plugin, busy, onInstall, onRemove }) => {
  const { t } = useTranslation('admin');
  const reason = plugin.error
    ? t(`plugins.unknown.errors.${plugin.error}`, { defaultValue: plugin.error })
    : null;

  return (
    <li className="border-b border-border">
      <Item size="sm">
        <ItemMedia variant="icon">
          <FolderOpen aria-hidden="true" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{plugin.name}</ItemTitle>
          <ItemDescription className="truncate">
            {plugin.pluginId}
            {plugin.version && ` · ${plugin.version}`}
          </ItemDescription>
          <Status variant="warning" className="mt-1">
            <StatusLabel>{t('plugins.unknown.badge')}</StatusLabel>
          </Status>
          {reason && (
            <p className="mt-1 text-caption text-destructive">
              {reason}
              {plugin.errors[0] ? ` ${plugin.errors[0]}` : ''}
            </p>
          )}
        </ItemContent>
        <ItemActions>
          <Button
            size="sm"
            variant="outline"
            disabled={busy || Boolean(plugin.error)}
            onClick={() => onInstall(plugin)}
          >
            <Download className="size-4" />
            {t('plugins.unknown.install')}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={busy}
            aria-label={t('plugins.unknown.delete', { name: plugin.name })}
            onClick={() => onRemove(plugin)}
          >
            <Trash2 className="size-4" />
          </Button>
        </ItemActions>
      </Item>
    </li>
  );
};

/** Plugin folders without registry entry: install them or delete their files. */
export const PluginUnknownList: React.FC<IPluginUnknownListProps> = ({
  loading,
  error,
  plugins,
  busy,
  onRetry,
  onInstall,
  onRemove,
}) => {
  const { t } = useTranslation('admin');

  if (loading) return <PluginListLoading />;
  if (error) return <PluginListError onRetry={onRetry} />;
  if (plugins.length === 0) {
    return (
      <PluginEmpty
        icon={<FolderOpen className="size-6" />}
        title={t('plugins.unknown.empty.title')}
        description={t('plugins.unknown.empty.description')}
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {plugins.map(plugin => (
        <UnknownRow key={plugin.pluginId} plugin={plugin} busy={busy} onInstall={onInstall} onRemove={onRemove} />
      ))}
    </ul>
  );
};
