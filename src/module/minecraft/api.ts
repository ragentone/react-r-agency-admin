import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type {
  IMinecraftBackupInfo,
  IMinecraftConsoleLine,
  IMinecraftPass,
  IMinecraftServerEntry,
  IMinecraftServerInput,
} from './types';

/* Parsed here instead of codegen `graphql()` (Muster admin-monitor/api.ts). */
const doc = {
  passes: parse(`query AdminMinecraftPasses { adminMinecraftPasses { success error passes } }`),
  blockPass: parse(
    `mutation AdminMinecraftBlockPass($id: String!, $blocked: Boolean) { adminMinecraftBlockPass(id: $id, blocked: $blocked) { success error } }`
  ),
  deletePass: parse(
    `mutation AdminMinecraftDeletePass($id: String!) { adminMinecraftDeletePass(id: $id) { success error } }`
  ),
  servers: parse(`query AdminMinecraftServers { adminMinecraftServers { success error servers } }`),
  create: parse(
    `mutation AdminMinecraftCreateServer($name: String!, $gamemode: String!, $maxPlayers: Int, $autostart: Boolean) { adminMinecraftCreateServer(name: $name, gamemode: $gamemode, maxPlayers: $maxPlayers, autostart: $autostart) { success error } }`
  ),
  update: parse(
    `mutation AdminMinecraftUpdateServer($serverId: String!, $name: String!, $gamemode: String!, $maxPlayers: Int, $autostart: Boolean) { adminMinecraftUpdateServer(serverId: $serverId, name: $name, gamemode: $gamemode, maxPlayers: $maxPlayers, autostart: $autostart) { success error restartRequired } }`
  ),
  remove: parse(
    `mutation AdminMinecraftDeleteServer($serverId: String!, $deleteFiles: Boolean) { adminMinecraftDeleteServer(serverId: $serverId, deleteFiles: $deleteFiles) { success error } }`
  ),
  start: parse(
    `mutation AdminMinecraftStart($serverId: String!) { adminMinecraftStart(serverId: $serverId) { success error } }`
  ),
  stop: parse(
    `mutation AdminMinecraftStop($serverId: String!) { adminMinecraftStop(serverId: $serverId) { success error } }`
  ),
  console: parse(
    `query AdminMinecraftConsoleHistory($serverId: String!, $after: Int) { adminMinecraftConsoleHistory(serverId: $serverId, after: $after) { success error lines last } }`
  ),
  sendCommand: parse(
    `mutation AdminMinecraftSendCommand($serverId: String!, $command: String!) { adminMinecraftSendCommand(serverId: $serverId, command: $command) { success error } }`
  ),
  backups: parse(
    `query AdminMinecraftBackups($serverId: String!) { adminMinecraftBackups(serverId: $serverId) { success error backups } }`
  ),
  restoreBackup: parse(
    `mutation AdminMinecraftRestoreBackup($serverId: String!, $file: String!) { adminMinecraftRestoreBackup(serverId: $serverId, file: $file) { success error } }`
  ),
  backupLink: parse(
    `mutation AdminMinecraftBackupLink($serverId: String!, $file: String!) { adminMinecraftBackupLink(serverId: $serverId, file: $file) { success error token } }`
  ),
  deleteBackup: parse(
    `mutation AdminMinecraftDeleteBackup($serverId: String!, $file: String!) { adminMinecraftDeleteBackup(serverId: $serverId, file: $file) { success error } }`
  ),
  backup: parse(
    `mutation AdminMinecraftBackup($serverId: String!) { adminMinecraftBackup(serverId: $serverId) { success error file size } }`
  ),
  kick: parse(
    `mutation AdminMinecraftKickPlayer($serverId: String!, $name: String!, $reason: String) { adminMinecraftKickPlayer(serverId: $serverId, name: $name, reason: $reason) { success error } }`
  ),
  broadcast: parse(
    `mutation AdminMinecraftBroadcast($serverId: String!, $message: String!, $mode: String) { adminMinecraftBroadcast(serverId: $serverId, message: $message, mode: $mode) { success error } }`
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
  remove: (serverId: string, deleteFiles: boolean) =>
    write<IMinecraftResult>(doc.remove, 'adminMinecraftDeleteServer', { serverId, deleteFiles }),
  start: (serverId: string) =>
    write<IMinecraftResult>(doc.start, 'adminMinecraftStart', { serverId }),
  stop: (serverId: string) => write<IMinecraftResult>(doc.stop, 'adminMinecraftStop', { serverId }),
  consoleHistory: (serverId: string, after: number) =>
    run<IMinecraftResult & { lines?: IMinecraftConsoleLine[]; last?: number }>(
      () =>
        client().query({
          query: doc.console as never,
          variables: { serverId, after },
          fetchPolicy: 'no-cache',
        }),
      'adminMinecraftConsoleHistory'
    ),
  sendCommand: (serverId: string, command: string) =>
    write<IMinecraftResult>(doc.sendCommand, 'adminMinecraftSendCommand', { serverId, command }),
  backups: (serverId: string) =>
    run<IMinecraftResult & { backups?: IMinecraftBackupInfo[] }>(
      () =>
        client().query({
          query: doc.backups as never,
          variables: { serverId },
          fetchPolicy: 'no-cache',
        }),
      'adminMinecraftBackups'
    ),
  restoreBackup: (serverId: string, file: string) =>
    write<IMinecraftResult>(doc.restoreBackup, 'adminMinecraftRestoreBackup', { serverId, file }),
  backupLink: (serverId: string, file: string) =>
    write<IMinecraftResult & { token?: string }>(doc.backupLink, 'adminMinecraftBackupLink', {
      serverId,
      file,
    }),
  deleteBackup: (serverId: string, file: string) =>
    write<IMinecraftResult>(doc.deleteBackup, 'adminMinecraftDeleteBackup', { serverId, file }),
  backup: (serverId: string) =>
    write<IMinecraftResult & { file?: string; size?: number }>(doc.backup, 'adminMinecraftBackup', {
      serverId,
    }),
  kickPlayer: (serverId: string, name: string, reason: string) =>
    write<IMinecraftResult>(doc.kick, 'adminMinecraftKickPlayer', { serverId, name, reason }),
  broadcast: (serverId: string, message: string, mode: 'chat' | 'title') =>
    write<IMinecraftResult>(doc.broadcast, 'adminMinecraftBroadcast', { serverId, message, mode }),
  restart: (serverId: string) =>
    write<IMinecraftResult>(doc.restart, 'adminMinecraftRestart', { serverId }),
  passes: () =>
    read<IMinecraftResult & { passes?: IMinecraftPass[] }>(doc.passes, 'adminMinecraftPasses'),
  blockPass: (id: string, blocked: boolean) =>
    write<IMinecraftResult>(doc.blockPass, 'adminMinecraftBlockPass', { id, blocked }),
  deletePass: (id: string) =>
    write<IMinecraftResult>(doc.deletePass, 'adminMinecraftDeletePass', { id }),
};
