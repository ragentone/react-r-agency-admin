import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Progress } from '@ui/shad-cn/components/progress.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorDisk } from '../../types';
import { formatBytes, percent } from '../../utils';

/** One bar per volume: used / total. */
export const MonitorDisks: React.FC<{ disks: IMonitorDisk[] }> = ({ disks }) => {
  const { t } = useTranslation('admin-monitor');
  if (!disks.length) return null;
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-4 p-4">
        <h3 className="text-title font-bold">{t('disks.title')}</h3>
        {disks.map(disk => {
          const used = disk.total - disk.free;
          return (
            <div key={disk.path} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-caption">
                <span className="min-w-0 truncate font-semibold">{disk.path}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {t('disks.usage', { used: formatBytes(used), total: formatBytes(disk.total) })}
                </span>
              </div>
              <Progress value={percent(used, disk.total)} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
