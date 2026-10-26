export type SystemTab = 'version' | 'storage';

/** One production frontend build (runtime `shared/system`, `adminSystemDeploys`). */
export interface ISystemDeploy {
  id: string;
  deploymentId: string;
  buildId: string | null;
  name: string | null;
  mode: string;
  status: 'running' | 'done' | 'stuck';
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  /** Devices told about the new version (null = no broadcast). */
  clients: number | null;
  /** Final once done, a preview while running, `null` for builds before version management. */
  version: string | null;
  bump: SystemReleaseBump | null;
  notes: string[];
  required: boolean;
}

export type SystemReleaseBump = 'patch' | 'minor' | 'major';

/** Internal version management (runtime `shared/system/system.version.ts`). */
export interface ISystemRelease {
  /** Live version (`null` = none yet → the next build becomes 1.0.0). */
  current: string | null;
  /** Plan of the next build (used up by it, then back to patch). */
  plan: { bump: SystemReleaseBump; notes: string[]; required: boolean };
  /** What each bump would give. */
  options: Record<SystemReleaseBump, string>;
}

export interface ISystemDeployHistory {
  deploys: ISystemDeploy[];
  /** Median duration of the finished builds (ms). */
  medianMs: number | null;
  running: number;
  release: ISystemRelease;
}

/** One measurement of the server disk (bytes, runtime `shared/system/system.storage.ts`). */
export interface ISystemStorage {
  measuredAt: string;
  disk: { total: number; free: number; used: number; percent: number };
  parts: {
    uploads: number;
    /** Part of `uploads`. */
    kidsUploads: number;
    backups: number;
    logs: number;
    /** `null` = binary log off or not readable. */
    binlogs: number | null;
  };
  binlogExpire: string;
  /** From this usage on the admins get an inbox message. */
  warnPercent: number;
}
