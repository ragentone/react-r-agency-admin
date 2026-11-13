import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Progress } from '@ui/shad-cn/components/progress.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorHeap } from '../../types';
import { formatBytes, formatCount, percent } from '../../utils';

/** Node internals: V8 heap against its limit, garbage collection, open handles. */
export const MonitorNode: React.FC<{ heap: IMonitorHeap; handles: number }> = ({
  heap,
  handles,
}) => {
  const { t } = useTranslation('admin-monitor');
  const rows: [string, string][] = [
    [t('node.total'), formatBytes(heap.total)],
    [t('node.external'), formatBytes(heap.external)],
    [
      t('node.gc'),
      t('node.gcValue', { count: formatCount(heap.gcCount), ms: formatCount(heap.gcTotalMs) }),
    ],
    [t('node.handles'), formatCount(handles)],
  ];
  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-title font-bold">{t('node.title')}</h3>
          <p className="text-caption text-muted-foreground">{t('node.text')}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-caption">
            <span className="font-semibold">{t('node.heap')}</span>
            <span className="tabular-nums text-muted-foreground">
              {formatBytes(heap.used)} / {formatBytes(heap.limit)}
            </span>
          </div>
          <Progress value={percent(heap.used, heap.limit)} className="h-2" />
        </div>
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 border-t border-border/50 pt-2 text-caption"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="tabular-nums">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
