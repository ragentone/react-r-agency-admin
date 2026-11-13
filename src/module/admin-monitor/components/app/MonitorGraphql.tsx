import { StatTile } from '@ui/patterns/chart';
import { Card, CardContent } from '@ui/shad-cn/components/card.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import { AlertTriangle, Gauge } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorGraphql } from '../../types.app';
import { formatCount } from '../../utils';

/** GraphQL traffic: totals as tiles, the slowest operations as a table. */
export const MonitorGraphql: React.FC<{ graphql: IMonitorGraphql }> = ({ graphql }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
        <StatTile
          icon={<Gauge />}
          label={t('graphql.total')}
          value={formatCount(graphql.total)}
          spark={graphql.perMinute}
        />
        <StatTile
          icon={<AlertTriangle />}
          label={t('graphql.errors')}
          value={formatCount(graphql.errors)}
        />
      </div>
      <Card className="rounded-xl border-border/50 shadow-none">
        <CardContent className="flex flex-col gap-3 p-4">
          <div>
            <h3 className="text-title font-bold">{t('graphql.opsTitle')}</h3>
            <p className="text-caption text-muted-foreground">{t('graphql.opsText')}</p>
          </div>
          {graphql.operations.length === 0 ? (
            <p className="text-body text-muted-foreground">{t('graphql.opsEmpty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-caption">{t('graphql.col.name')}</TableHead>
                    <TableHead className="text-right text-caption">
                      {t('graphql.col.count')}
                    </TableHead>
                    <TableHead className="text-right text-caption">
                      {t('graphql.col.errors')}
                    </TableHead>
                    <TableHead className="text-right text-caption">
                      {t('graphql.col.avg')}
                    </TableHead>
                    <TableHead className="text-right text-caption">
                      {t('graphql.col.p95')}
                    </TableHead>
                    <TableHead className="px-4 text-right text-caption">
                      {t('graphql.col.max')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {graphql.operations.map(op => (
                    <TableRow key={op.name} className="border-border/50">
                      <TableCell className="font-mono text-caption">{op.name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(op.count)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(op.errors)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{op.avgMs} ms</TableCell>
                      <TableCell className="text-right tabular-nums">{op.p95Ms} ms</TableCell>
                      <TableCell className="px-4 text-right tabular-nums">
                        {op.maxMs} ms
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
