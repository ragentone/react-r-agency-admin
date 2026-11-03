import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Download, FolderOpen, RotateCcw, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginUnknownItem } from '../types';

interface IPluginUnknownListProps {
  loading: boolean;
  error: boolean;
  plugins: IPluginUnknownItem[];
  busy: boolean;
  onRetry: () => void;
  onInstall: (plugin: IPluginUnknownItem) => void;
  onRemove: (plugin: IPluginUnknownItem) => void;
}

/** Plugin folders in `plugins/` without a registry entry: install them or delete their files. */
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

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-3" aria-busy="true">
        {[0, 1].map(index => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t('plugins.error.title')}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="lg" onClick={onRetry}>
            <RotateCcw className="size-4" />
            {t('plugins.error.retry')}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (plugins.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <FolderOpen className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('plugins.unknown.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('plugins.unknown.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col">
      {plugins.map(plugin => (
        <li key={plugin.pluginId} className="flex items-center gap-3 border-b border-border px-4 py-3">
          <FolderOpen className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-bold text-foreground">{plugin.name}</p>
            <p className="truncate text-caption text-muted-foreground">
              {plugin.pluginId}
              {plugin.version && ` · ${plugin.version}`}
            </p>
            {plugin.error && (
              <p className="text-caption text-destructive">
                {t(`plugins.unknown.errors.${plugin.error}`, { defaultValue: plugin.error })}
                {plugin.errors[0] ? ` ${plugin.errors[0]}` : ''}
              </p>
            )}
          </div>
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
        </li>
      ))}
    </ul>
  );
};
