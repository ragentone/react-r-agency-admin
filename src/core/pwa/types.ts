/** Chrome / Edge / Android: deferred native install prompt. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export type PwaInstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

export interface IPwaContext {
  /** Native install prompt available (Chrome, Edge, Android). */
  canInstall: boolean;
  /** iOS / iPadOS Safari: no prompt API → manual "Add to Home Screen" instructions. */
  iosInstallable: boolean;
  /** Runs as installed app (standalone / window controls overlay). */
  installed: boolean;
  /** Shows the native prompt (or resolves `unavailable`). */
  install: () => Promise<PwaInstallOutcome>;
  /** Install sheet (info + button / iOS steps). */
  installSheetOpen: boolean;
  openInstallSheet: () => void;
  closeInstallSheet: (dismiss?: boolean) => void;
  /** A new version is waiting. */
  needRefresh: boolean;
  /** Activates the waiting service worker and reloads. */
  update: () => Promise<void>;
  /** Internal version of this tab (`1.0.2`, `null` = unknown: dev or an older build). */
  version: string | null;
  /** Newer build that is live (`null` = this tab is up to date / nothing known). */
  available: IPwaRelease | null;
  /** All assets are cached – the app works offline. */
  offlineReady: boolean;
  online: boolean;
}

export type PwaReleaseBump = 'patch' | 'minor' | 'major';

/** A frontend build with its internal version (runtime `shared/system/system.version.ts`). */
export interface IPwaRelease {
  version: string | null;
  bump: PwaReleaseBump | null;
  /** "What's new", one item per entry. */
  notes: string[];
  /** Old tabs must update (no dismiss, reload when idle). */
  required: boolean;
}

/** Events on the `system` websocket channel (runtime `shared/system/system.deploy.ts`). */
export interface IPwaLiveEvents {
  /** A production frontend build started – an update is on its way. */
  deploy: { phase: 'before'; deploymentId: string; at: number };
  /** A new frontend build is live; `buildId` = `import.meta.env.VITE_APP.id` of that build. */
  version: IPwaRelease & {
    deploymentId: string;
    buildId: string | null;
    name: string | null;
    at: number;
  };
}
