/** Mirror of runtime `shared/monitor/types.app.ts`. */
export interface IMonitorWs {
  connected: number;
  peak: number;
  opened: number;
  closed: number;
  avgSessionSec: number;
  messages: number[];
}

export interface IMonitorOperation {
  name: string;
  count: number;
  errors: number;
  avgMs: number;
  p95Ms: number;
  maxMs: number;
}

export interface IMonitorGraphql {
  total: number;
  errors: number;
  perMinute: number[];
  operations: IMonitorOperation[];
}

export interface IMonitorCron {
  name: string;
  active: boolean;
  expression: string;
  status: 'running' | 'pending';
  nextRun: string | null;
}

export interface IMonitorPlugin {
  id: string;
  name: string;
  version: string;
  status: string;
}

export interface IMonitorDb {
  connected: boolean;
  latencyMs: number;
  threads: number;
  running: number;
  slowQueries: number;
  questions: number;
  uptime: number;
  totalBytes: number;
  tables: { name: string; bytes: number; rows: number }[];
  longRunning: { id: number; seconds: number; state: string; query: string }[];
}

export interface IMonitorApp {
  generatedAt: string;
  ws: IMonitorWs;
  graphql: IMonitorGraphql;
  cron: IMonitorCron[];
  plugins: IMonitorPlugin[];
  db: IMonitorDb;
  mesh: { version: string; node: string; env: string; startedAt: string };
}
