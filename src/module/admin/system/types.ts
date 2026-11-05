export type SystemTab = 'version' | 'storage' | 'database';

export type SystemReleaseBump = 'patch' | 'minor' | 'major';

/** The live frontend build – the only version that is stored and shown (runtime `system.deploy.service`). */
export interface ISystemVersion {
  deploymentId: string;
  buildId: string | null;
  /** ISO time the build finished. */
  finishedAt: string;
  /** `null` = no version yet (before version management). */
  version: string | null;
  bump: SystemReleaseBump | null;
  notes: string[];
  required: boolean;
}

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
  /** The live build (`null` = none yet). */
  current: ISystemVersion | null;
  release: ISystemRelease;
}

/** One measurement of the server disk (bytes, runtime `shared/system/system.storage.ts`). */
export interface ISystemStorage {
  measuredAt: string;
  disk: { total: number; free: number; used: number; percent: number };
  parts: {
    uploads: number;
    backups: number;
    logs: number;
    /** `null` = binary log off or not readable. */
    binlogs: number | null;
  };
  binlogExpire: string;
  /** From this usage on the admins get an inbox message. */
  warnPercent: number;
}

/** Table usage check (runtime `shared/db-usage`, admin only, read-only). */
export type DbUsageStatus = 'in-use' | 'storage' | 'unknown' | 'plugin-orphan';

export interface IDbUsageTable {
  name: string;
  rows: number;
  status: DbUsageStatus;
  reason: string;
}

export interface IDbUsageReport {
  generatedAt: string;
  database: string;
  summary: {
    inUse: number;
    storage: number;
    unknown: number;
    pluginOrphan: number;
    missing: number;
  };
  tables: IDbUsageTable[];
  missing: string[];
}
