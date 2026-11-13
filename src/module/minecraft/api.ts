import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IMinecraftServerEntry, IMinecraftServerInput } from './types';

/* Parsed here instead of codegen `graphql()` (Muster admin-monitor/api.ts). */
const doc = {
  servers: parse(`query AdminMinecraftServers { adminMinecraftServers { success error servers } }`),
  create: parse(
    `mutation AdminMinecraftCreateServer($name: String!, $gamemode: String!, $maxPlayers: Int) { adminMinecraftCreateServer(name: $name, gamemode: $gamemode, maxPlayers: $maxPlayers) { success error } }`
  ),
  update: parse(
    `mutation AdminMinecraftUpdateServer($serverId: String!, $name: String!, $gamemode: String!, $maxPlayers: Int, $autostart: Boolean) { adminMinecraftUpdateServer(serverId: $serverId, name: $name, gamemode: $gamemode, maxPlayers: $maxPlayers, autostart: $autostart) { success error restartRequired } }`
  ),
  remove: parse(
    `mutation AdminMinecraftDeleteServer($serverId: String!) { adminMinecraftDeleteServer(serverId: $serverId) { success error } }`
  ),
  start: parse(
    `mutation AdminMinecraftStart($serverId: String!) { adminMinecraftStart(serverId: $serverId) { success error } }`
  ),
  stop: parse(
    `mutation AdminMinecraftStop($serverId: String!) { adminMinecraftStop(serverId: $serverId) { success error } }`
  ),
  restart: parse(
    `mutation AdminMinecraftRestart($serverId: String!) { adminMinecraftRestart(serverId: $serverId) { success error } }`
  ),
};

export interface IMinecraftResult {
  success: boolean;
  error?: string | null;
}

const client = () => getMeshClient().graphql();

const run = async <T extends IMinecraftResult>(
  call: () => Promise<unknown>,
  field: string
): Promise<T> => {
  try {
    const response = (await call()) as { data?: Record<string, T | null> };
    return response.data?.[field] ?? ({ success: false, error: 'unknown' } as T);
  } catch (error) {
    console.warn('[minecraft]', (error as Error)?.message);
    return { success: false, error: 'unknown' } as T;
  }
};

const read = <T extends IMinecraftResult>(query: unknown, field: string) =>
  run<T>(() => client().query({ query: query as never, fetchPolicy: 'no-cache' }), field);

const write = <T extends IMinecraftResult>(mutation: unknown, field: string, variables?: object) =>
  run<T>(() => client().mutate({ mutation: mutation as never, variables }), field);

/** Admin only (`admin:user`, checked in runtime `apps/minecraft`). */
export const AdminMinecraftApi = {
  servers: () =>
    read<IMinecraftResult & { servers?: IMinecraftServerEntry[] }>(
      doc.servers,
      'adminMinecraftServers'
    ),
  create: (input: IMinecraftServerInput) =>
    write<IMinecraftResult>(doc.create, 'adminMinecraftCreateServer', input),
  update: (serverId: string, input: IMinecraftServerInput) =>
    write<IMinecraftResult & { restartRequired?: boolean }>(
      doc.update,
      'adminMinecraftUpdateServer',
      { serverId, ...input }
    ),
  remove: (serverId: string) =>
    write<IMinecraftResult>(doc.remove, 'adminMinecraftDeleteServer', { serverId }),
  start: (serverId: string) =>
    write<IMinecraftResult>(doc.start, 'adminMinecraftStart', { serverId }),
  stop: (serverId: string) => write<IMinecraftResult>(doc.stop, 'adminMinecraftStop', { serverId }),
  restart: (serverId: string) =>
    write<IMinecraftResult>(doc.restart, 'adminMinecraftRestart', { serverId }),
};
