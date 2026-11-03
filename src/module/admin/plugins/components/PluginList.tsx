import { Button } from '@ui/shad-cn/components/button.tsx';
import { Package, Plus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IPluginListItem } from '../types';
import { PluginRow } from './PluginRow';
import { PluginEmpty, PluginListError, PluginListLoading } from './PluginStates';

interface IPluginListProps {
  loading: boolean;
  error: boolean;
  plugins: IPluginListItem[];
  onRetry: () => void;
  onCreate: () => void;
}

/** Installed plugins: loading, error, empty (with the create action) or the list. */
export const PluginList: React.FC<IPluginListProps> = ({ loading, error, plugins, onRetry, onCreate }) => {
  const { t } = useTranslation('admin');

  if (loading) return <PluginListLoading />;
  if (error) return <PluginListError onRetry={onRetry} />;
  if (plugins.length === 0) {
    return (
      <PluginEmpty
        icon={<Package className="size-6" />}
        title={t('plugins.empty.title')}
        description={t('plugins.empty.description')}
        action={
          <Button size="lg" onClick={onCreate}>
            <Plus className="size-4" />
            {t('plugins.empty.action')}
          </Button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col">
      {plugins.map(plugin => (
        <PluginRow key={plugin.pluginId} plugin={plugin} />
      ))}
    </ul>
  );
};
