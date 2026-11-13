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
import { Database, Gauge, Timer, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorDb } from '../../types.app';
import { formatBytes, formatCount, formatDuration } from '../../utils';

/** Database health: connection, latency, threads/queries as tiles, tables and slow queries. */
export const MonitorDb: React.FC<{ db: IMonitorDb }> = ({ db }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile
          icon={<Database />}
          label={t('db.latency')}
          value={db.connected ? `${db.latencyMs} ms` : '–'}
          hint={db.connected ? t('db.connected') : t('db.disconnected')}
        />
        <StatTile
          icon={<Users />}
          label={t('db.threads')}
          value={formatCount(db.threads)}
          hint={t('db.running', { running: formatCount(db.running) })}
        />
        <StatTile
          icon={<Gauge />}
          label={t('db.questions')}
          value={formatCount(db.questions)}
          hint={t('db.slowQueries', { count: formatCount(db.slowQueries) })}
        />
        <StatTile
          icon={<Timer />}
          label={t('db.uptime')}
          value={formatDuration(db.uptime)}
          hint={formatBytes(db.totalBytes)}
        />
      </div>
      <Card className="rounded-xl border-border/50 shadow-none">
        <CardContent className="flex flex-col gap-3 p-4">
          <div>
            <h3 className="text-title font-bold">{t('db.tablesTitle')}</h3>
            <p className="text-caption text-muted-foreground">{t('db.tablesText')}</p>
          </div>
          {db.tables.length === 0 ? (
            <p className="text-body text-muted-foreground">{t('db.tablesEmpty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-caption">{t('db.col.table')}</TableHead>
                    <TableHead className="text-right text-caption">{t('db.col.rows')}</TableHead>
                    <TableHead className="px-4 text-right text-caption">
                      {t('db.col.size')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {db.tables.map(table => (
                    <TableRow key={table.name} className="border-border/50">
                      <TableCell className="font-mono text-caption">{table.name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCount(table.rows)}
                      </TableCell>
                      <TableCell className="px-4 text-right tabular-nums">
                        {formatBytes(table.bytes)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {db.longRunning.length > 0 && (
        <Card className="rounded-xl border-border/50 shadow-none">
          <CardContent className="flex flex-col gap-3 p-4">
            <div>
              <h3 className="text-title font-bold">{t('db.longRunningTitle')}</h3>
              <p className="text-caption text-muted-foreground">{t('db.longRunningText')}</p>
            </div>
            <ul className="flex flex-col divide-y divide-border/50">
              {db.longRunning.map(query => (
                <li key={query.id} className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3 text-caption">
                    <span className="font-semibold text-muted-foreground">{query.state}</span>
                    <span className="tabular-nums font-bold">
                      {query.seconds.toFixed(1)} s
                    </span>
                  </div>
                  <p className="break-all font-mono text-caption text-muted-foreground">
                    {query.query}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
