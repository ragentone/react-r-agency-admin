export type IMinecraftRunState = 'stopped' | 'starting' | 'running' | 'stopping' | 'crashed';

export const MINECRAFT_GAMEMODES = ['survival', 'creative', 'adventure'] as const;
export type IMinecraftGamemode = (typeof MINECRAFT_GAMEMODES)[number];

export interface IMinecraftServer {
  id: string;
  slug: string;
  name: string;
  gamemode: IMinecraftGamemode;
  port: number;
  portV6: number;
  maxPlayers: number;
  autostart: boolean;
}

export interface IMinecraftStatus {
  serverId: string;
  state: IMinecraftRunState;
  pid: number | null;
  container: string | null;
  startedAt: string | null;
  lastExitCode: number | null;
  lastError: string | null;
  restartAttempts: number;
}

export interface IMinecraftOnlinePlayer {
  name: string;
  xuid: string;
  joinedAt: string;
}

export interface IMinecraftMetrics {
  cpu: number;
  memBytes: number;
  at: string;
}

export interface IMinecraftServerEntry {
  server: IMinecraftServer;
  status: IMinecraftStatus;
  players?: IMinecraftOnlinePlayer[];
  metrics?: IMinecraftMetrics | null;
}

export interface IMinecraftServerInput {
  name: string;
  gamemode: IMinecraftGamemode;
  maxPlayers: number;
  autostart: boolean;
}

export interface IMinecraftBackupInfo {
  file: string;
  size: number;
  createdAt: string;
}

export interface IMinecraftConsoleLine {
  seq: number;
  ts: string;
  kind: 'out' | 'in' | 'err';
  text: string;
}

/** Spielerpass-Eintrag (Admin-Sicht). */
export interface IMinecraftPass {
  id: string;
  alias: string;
  gamertag: string;
  status: 'active' | 'paused' | 'blocked';
  xuid: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

/** Server, auf dem ein Spieler gerade online ist. */
export interface IMinecraftPlayerOnline {
  serverId: string;
  serverName: string;
  joinedAt: string;
}

/** Spieler in der Übersicht; `unlisted` = online, aber ohne Spielerpass-Eintrag (`id` = `null`). */
export interface IMinecraftPlayer {
  id: string | null;
  gamertag: string;
  alias: string | null;
  xuid: string | null;
  status: 'active' | 'paused' | 'blocked' | 'unlisted';
  createdAt: string | null;
  lastSeenAt: string | null;
  online: IMinecraftPlayerOnline[];
}

/** Auto-Backup-Zeitplan (gilt für alle Server, Serverzeit). */
export interface IMinecraftBackupSettings {
  enabled: boolean;
  /** 0–23 */
  hour: number;
  /** 1–30 Backups je Server */
  keep: number;
}

export const MINECRAFT_DIFFICULTIES = ['peaceful', 'easy', 'normal', 'hard'] as const;
export const MINECRAFT_PERMISSIONS = ['visitor', 'member', 'operator'] as const;

/** Einstellungen der Spielwelt (`server.properties`), je Server; gelten ab dem nächsten Start. */
export interface IMinecraftWorldSettings {
  difficulty: (typeof MINECRAFT_DIFFICULTIES)[number];
  /** 5–32 Chunks */
  viewDistance: number;
  /** 4–12 Chunks */
  tickDistance: number;
  permission: (typeof MINECRAFT_PERMISSIONS)[number];
  cheats: boolean;
}

/** BDS-Installation (nativer Modus), Stand der Installation. */
export interface IMinecraftBdsStatus {
  native: boolean;
  installed: boolean;
  version: string | null;
  dir: string;
  phase: 'idle' | 'downloading' | 'installing' | 'done' | 'error';
  progress: { received: number; total: number | null } | null;
  error: string | null;
  latest: string | null;
}

export const MINECRAFT_GAMERULES = [
  'keepInventory',
  'doDaylightCycle',
  'doWeatherCycle',
  'doMobSpawning',
  'mobGriefing',
  'pvp',
  'showCoordinates',
  'naturalRegeneration',
  'doInsomnia',
  'fallDamage',
  'fireDamage',
  'tntExplodes',
] as const;

export type MinecraftGamerule = (typeof MINECRAFT_GAMERULES)[number];

/** `null` = der Server hat den Wert nicht (erkennbar) geantwortet. */
export type IMinecraftGamerules = Partial<Record<MinecraftGamerule, boolean | null>>;
