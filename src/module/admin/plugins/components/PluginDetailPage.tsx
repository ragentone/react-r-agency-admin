import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from '@ui/shad-cn/components/empty.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePluginList } from '../hooks/use-plugin-list';
import { PluginDetailHeader } from './PluginDetailHeader';
import { PluginDetailView } from './PluginDetailView';

/**
 * `/admin/plugins/<id>`: finds the plugin in the list. A reload keeps the page mounted once it is loaded,
 * so open drawers stay open.
 */
export const PluginDetailPage: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const { t } = useTranslation('admin');
  const { loading, error, plugins, reload } = usePluginList();
  const plugin = plugins.find(item => item.pluginId === pluginId) ?? null;

  if (loading && plugin === null) {
    return (
      <div className="flex flex-col gap-3 px-4 py-4" aria-busy="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (plugin === null || error) {
    return (
      <div className="flex flex-col">
        <PluginDetailHeader />
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{error ? t('plugins.error.title') : t('plugins.details.notFound')}</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            {error && (
              <button type="button" className="text-body font-bold underline" onClick={() => void reload()}>
                {t('plugins.error.retry')}
              </button>
            )}
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return <PluginDetailView plugin={plugin} reload={() => void reload()} />;
};
