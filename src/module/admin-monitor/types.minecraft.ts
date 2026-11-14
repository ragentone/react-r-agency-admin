export type MonitorMinecraftState = 'stopped' | 'starting' | 'running' | 'stopping' | 'crashed';

/** Mirror of runtime `apps/minecraft/services/monitor/types.ts`. */
export interface IMonitorMinecraftServer {
  id: string;
  name: string;
  gamemode: string;
  port: number;
  state: MonitorMinecraftState;
  players: number;
  maxPlayers: number;
  cpu: number | null;
  memBytes: number | null;
  lastError: string | null;
}

export interface IMonitorMinecraft {
  servers: IMonitorMinecraftServer[];
  running: number;
  players: number;
  memBytes: number;
  /** Share of the host memory in percent. */
  memShare: number;
}
