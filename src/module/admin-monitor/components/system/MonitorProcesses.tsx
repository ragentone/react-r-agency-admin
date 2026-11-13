import { BarList } from '@ui/patterns/chart';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import { Tabs, TabsList, TabsTrigger } from '@ui/shad-cn/components/tabs.tsx';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorProcess } from '../../types';
import { formatBytes } from '../../utils';
import { MonitorKillDrawer } from './MonitorKillDrawer';

type SortKey = 'cpu' | 'mem';
const SHORT = 10;
const LONG = 25;

/** Busiest processes as a bar chart list, sortable by CPU or memory. */
export const MonitorProcesses: React.FC<{ processes: IMonitorProcess[] }> = ({ processes }) => {
  const { t } = useTranslation('admin-monitor');
  const [sort, setSort] = useState<SortKey>('cpu');
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<IMonitorProcess | null>(null);

  const items = useMemo(
    () =>
      [...processes]
        .sort((a, b) => b[sort] - a[sort])
        .slice(0, expanded ? LONG : SHORT)
        .map(p => ({
          key: String(p.pid),
          label: (
            <span className="flex min-w-0 flex-col" title={p.command}>
              <span className="truncate">{p.name}</span>
              <span className="text-micro font-normal text-muted-foreground">
                {t('processes.cores', {
                  pid: p.pid,
                  cpu: p.cpu.toFixed(1),
                  mem: formatBytes(p.mem),
                })}
              </span>
            </span>
          ),
          value: p[sort],
          display: sort === 'cpu' ? `${p.cpu.toFixed(1)} %` : formatBytes(p.mem),
          onClick: () => setSelected(p),
        })),
    [processes, sort, expanded, t]
  );

  return (
    <Card className="rounded-xl border-border/50 shadow-none">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-title font-bold">{t('processes.title')}</h3>
            <p className="text-caption text-muted-foreground">{t('processes.text')}</p>
          </div>
          <Tabs value={sort} onValueChange={value => setSort(value as SortKey)}>
            <TabsList>
              <TabsTrigger value="cpu">{t('processes.cpu')}</TabsTrigger>
              <TabsTrigger value="mem">{t('processes.mem')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <BarList
          items={items}
          empty={<p className="text-body text-muted-foreground">{t('processes.empty')}</p>}
        />
        {processes.length > SHORT && (
          <Button variant="ghost" size="sm" onClick={() => setExpanded(value => !value)}>
            {t(expanded ? 'processes.less' : 'processes.more')}
          </Button>
        )}
        <MonitorKillDrawer process={selected} onClose={() => setSelected(null)} />
      </CardContent>
    </Card>
  );
};
