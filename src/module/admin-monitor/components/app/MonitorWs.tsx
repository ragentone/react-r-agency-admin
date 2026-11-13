import { StatTile } from '@ui/patterns/chart';
import { ArrowDownUp, Timer, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMonitorWs } from '../../types.app';
import { formatCount, formatDuration } from '../../utils';

/** WebSocket key figures: connected, peak, opened/closed, average session length. */
export const MonitorWs: React.FC<{ ws: IMonitorWs }> = ({ ws }) => {
  const { t } = useTranslation('admin-monitor');
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatTile
        icon={<Users />}
        label={t('ws.connected')}
        value={formatCount(ws.connected)}
        hint={t('ws.peak', { peak: formatCount(ws.peak) })}
        spark={ws.messages}
      />
      <StatTile
        icon={<ArrowDownUp />}
        label={t('ws.opened')}
        value={formatCount(ws.opened)}
        hint={t('ws.closed', { closed: formatCount(ws.closed) })}
      />
      <StatTile
        icon={<Timer />}
        label={t('ws.avgSession')}
        value={formatDuration(ws.avgSessionSec)}
      />
      <StatTile
        icon={<ArrowDownUp />}
        label={t('ws.messages')}
        value={formatCount(ws.messages.at(-1) ?? 0)}
        hint={t('ws.messagesHint')}
        spark={ws.messages}
      />
    </div>
  );
};
