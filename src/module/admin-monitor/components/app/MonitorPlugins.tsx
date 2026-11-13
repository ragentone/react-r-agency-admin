import { BarList } from '@ui/patterns/chart';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorPlugin } from '../../types.app';

/** Installed plugins: name, version and status as a list (no chart dimension here). */
export const MonitorPlugins: React.FC<{ plugins: IMonitorPlugin[] }> = ({ plugins }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-title font-bold">{t('plugins.title')}</h3>
          <p className="text-caption text-muted-foreground">{t('plugins.text')}</p>
        </div>
        <BarList
          hollow
          items={plugins.map(plugin => ({
            key: plugin.id,
            label: (
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{plugin.name}</span>
                <span className="text-micro font-normal text-muted-foreground">
                  v{plugin.version}
                </span>
              </span>
            ),
            value: 1,
            display: plugin.status,
          }))}
          empty={<p className="text-body text-muted-foreground">{t('plugins.empty')}</p>}
        />
      </CardContent>
    </Card>
  );
};
