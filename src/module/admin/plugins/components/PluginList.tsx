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
import { Package, RotateCcw } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';
import { PluginRow } from './PluginRow';

interface IPluginListProps {
  loading: boolean;
  error: boolean;
  plugins: IPluginListItem[];
  onRetry: () => void;
  onSelect: (plugin: IPluginListItem) => void;
}

/** Loading, error, empty and list state of the installed plugins. */
export const PluginList: React.FC<IPluginListProps> = ({
  loading,
  error,
  plugins,
  onRetry,
  onSelect,
}) => {
  const { t } = useTranslation('admin');

  if (loading) {
    return (
      <div className="flex flex-col gap-3 px-4 py-3" aria-busy="true">
        {[0, 1, 2].map(index => (
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
            <Package className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t('plugins.empty.title')}</EmptyTitle>
          <EmptyDescription>{t('plugins.empty.description')}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col">
      {plugins.map(plugin => (
        <PluginRow key={plugin.pluginId} plugin={plugin} onSelect={() => onSelect(plugin)} />
      ))}
    </ul>
  );
};
