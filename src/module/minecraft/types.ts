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

export interface IMinecraftConsoleLine {
  seq: number;
  ts: string;
  kind: 'out' | 'in' | 'err';
  text: string;
}
