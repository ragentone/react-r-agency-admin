/** Mirrors runtime `shared/cron/types.ts`. */
export interface ICronRun {
  name: string;
  at: string;
  durationMs: number;
  success: boolean;
  error: string | null;
  by: string;
}

export interface ICronJob {
  name: string;
  expression: string;
  active: boolean;
  status: 'running' | 'pending';
  nextRun: string | null;
  lastRun: ICronRun | null;
}

export type CronFilter = 'all' | 'active' | 'inactive';
