export type SystemTab = 'deployments' | 'storage' | 'database';

export type SystemReleaseBump = 'patch' | 'minor' | 'major';

/** Release line: the site (`frontend`), the admin app or the runtime server. */
export type SystemDeployApp = 'frontend' | 'admin' | 'runtime';

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
  plan: { bump: SystemReleaseBump; notes: string[]; required: boolean; buildPath: string | null };
  /** What each bump would give. */
  options: Record<SystemReleaseBump, string>;
}

export interface ISystemDeployHistory {
  /** The live frontend build (`null` = none yet). */
  current: ISystemVersion | null;
  release: ISystemRelease;
  /** The live admin build with its own plan. */
  admin: { current: ISystemVersion | null; release: ISystemRelease };
  /** The runtime server (deploys recorded by the CLI) with its own plan. */
  runtime: { current: ISystemVersion | null; release: ISystemRelease };
  /** A runtime deploy from the admin is running (lock file on the server). */
  runtimeRunning?: boolean;
  /** Live server (production mode) only: the deploy button is shown just there. */
  runtimeDeployable?: boolean;
  /** A frontend build from the admin is running (lock file on the server). */
  frontendRunning?: boolean;
  /** Live server with the frontend folder present. */
  frontendDeployable?: boolean;
  /** An admin build from the admin is running (lock file on the server). */
  adminRunning?: boolean;
  /** Live server with the admin app folder present. */
  adminDeployable?: boolean;
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

/** One registered entity and its table (runtime `db-usage-service.entities()`). */
export interface IDbEntity {
  entity: string;
  table: string;
  columns: number;
  relations: number;
  /** `null` = table does not exist in the database. */
  rows: number | null;
}
