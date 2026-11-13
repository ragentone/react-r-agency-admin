/** Mirror of runtime `shared/monitor/types.ts`. */
export interface IMonitorSample {
  t: number;
  cpu: number;
  memUsed: number;
  memTotal: number;
  memCached: number;
  swapUsed: number;
  swapTotal: number;
  rss: number;
  heapUsed: number;
  procCpu: number;
  loopMs: number;
  netRx: number;
  netTx: number;
  gcMs: number;
  handles: number;
  cores: number[];
}

export interface IMonitorDisk {
  path: string;
  total: number;
  free: number;
}

export interface IMonitorHost {
  hostname: string;
  platform: string;
  arch: string;
  cpuModel: string;
  cpuCount: number;
  node: string;
  pid: number;
  uptime: number;
  processUptime: number;
  load: [number, number, number];
}

export interface IMonitorProcess {
  pid: number;
  name: string;
  command: string;
  cpu: number;
  mem: number;
}

export interface IMonitorSnapshot {
  generatedAt: string;
  host: IMonitorHost;
  disks: IMonitorDisk[];
  current: IMonitorSample | null;
  history: IMonitorSample[];
  processes: IMonitorProcess[];
  heap: IMonitorHeap;
  status: MonitorStatus;
}

export type MonitorStatus = 'ok' | 'warn' | 'crit';

export interface IMonitorHeap {
  total: number;
  used: number;
  limit: number;
  external: number;
  gcCount: number;
  gcTotalMs: number;
}
