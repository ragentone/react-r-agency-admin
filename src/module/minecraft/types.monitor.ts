import type { IMinecraftRunState } from './types';

/** Mirror of runtime `apps/minecraft/services/monitor/types.ts` (section `minecraft` of the monitor). */
export interface IMinecraftMonitorServer {
  id: string;
  name: string;
  gamemode: string;
  port: number;
  state: IMinecraftRunState;
  players: number;
  maxPlayers: number;
  cpu: number | null;
  memBytes: number | null;
  lastError: string | null;
}

export interface IMinecraftMonitor {
  servers: IMinecraftMonitorServer[];
  running: number;
  players: number;
  memBytes: number;
  /** Share of the host memory in percent. */
  memShare: number;
}
