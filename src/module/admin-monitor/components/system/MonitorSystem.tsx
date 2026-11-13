import React from 'react';

import type { IMonitorSnapshot } from '../../types';
import { MonitorCharts } from './MonitorCharts';
import { MonitorCores } from './MonitorCores';
import { MonitorDisks } from './MonitorDisks';
import { MonitorHost } from './MonitorHost';
import { MonitorNode } from './MonitorNode';
import { MonitorProcesses } from './MonitorProcesses';
import { MonitorTiles } from './MonitorTiles';

/** Tab "System": machine and Node process. */
export const MonitorSystem: React.FC<{ snapshot: IMonitorSnapshot }> = ({ snapshot }) => (
  <>
    <MonitorTiles snapshot={snapshot} />
    <MonitorCharts history={snapshot.history} />
    <MonitorCores cores={snapshot.current?.cores ?? []} />
    <MonitorProcesses processes={snapshot.processes} />
    <MonitorNode heap={snapshot.heap} handles={snapshot.current?.handles ?? 0} />
    <MonitorDisks disks={snapshot.disks} />
    <MonitorHost host={snapshot.host} />
  </>
);
