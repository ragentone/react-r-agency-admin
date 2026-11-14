import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type {
  IMinecraftBackupInfo,
  IMinecraftBackupSettings,
  IMinecraftBdsStatus,
  IMinecraftConsoleLine,
  IMinecraftGamerules,
  IMinecraftPass,
  IMinecraftPlayer,
  IMinecraftServerEntry,
  IMinecraftServerInput,
  IMinecraftWorldSettings,
} from './types';

/* Parsed here instead of codegen `graphql()` (Muster admin-monitor/api.ts). */
const doc = {
  passes: parse(`query AdminMinecraftPasses { adminMinecraftPasses { success error passes } }`),
  players: parse(`query AdminMinecraftPlayers { adminMinecraftPlayers { success error players } }`),
  blockPass: parse(
    `mutation AdminMinecraftBlockPass($id: String!, $blocked: Boolean) { adminMinecraftBlockPass(id: $id, blocked: $blocked) { success error } }`
  ),
  createPass: parse(
    `mutation AdminMinecraftCreatePass($gamertag: String!) { adminMinecraftCreatePass(gamertag: $gamertag) { success error } }`
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
  backupSettings: parse(
    `query AdminMinecraftBackupSettings { adminMinecraftBackupSettings { success error settings } }`
  ),
  backupSettingsSave: parse(
    `mutation AdminMinecraftBackupSettingsSave($settings: JSON!) { adminMinecraftBackupSettingsSave(settings: $settings) { success error settings } }`
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
  messagePlayer: parse(
    `mutation AdminMinecraftMessagePlayer($serverId: String!, $name: String!, $message: String!, $mode: String) { adminMinecraftMessagePlayer(serverId: $serverId, name: $name, message: $message, mode: $mode) { success error } }`
  ),
  broadcast: parse(
    `mutation AdminMinecraftBroadcast($serverId: String!, $message: String!, $mode: String) { adminMinecraftBroadcast(serverId: $serverId, message: $message, mode: $mode) { success error } }`
  ),
  worldGet: parse(
    `query AdminMinecraftWorldGet($serverId: String!) { adminMinecraftWorldGet(serverId: $serverId) { success error settings } }`
  ),
  worldSave: parse(
    `mutation AdminMinecraftWorldSave($serverId: String!, $settings: JSON!) { adminMinecraftWorldSave(serverId: $serverId, settings: $settings) { success error settings restartRequired } }`
  ),
  bdsStatus: parse(
    `query AdminMinecraftBdsStatus { adminMinecraftBdsStatus { success error status } }`
  ),
  bdsInstall: parse(
    `mutation AdminMinecraftBdsInstall { adminMinecraftBdsInstall { success error } }`
  ),
  gameruleList: parse(
    `query AdminMinecraftGameruleList($serverId: String!) { adminMinecraftGameruleList(serverId: $serverId) { success error rules } }`
  ),
  gameruleSet: parse(
    `mutation AdminMinecraftGameruleSet($serverId: String!, $name: String!, $value: Boolean!) { adminMinecraftGameruleSet(serverId: $serverId, name: $name, value: $value) { success error } }`
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
  backupSettings: () =>
    run<IMinecraftResult & { settings?: IMinecraftBackupSettings }>(
      () => client().query({ query: doc.backupSettings as never, fetchPolicy: 'no-cache' }),
      'adminMinecraftBackupSettings'
    ),
  saveBackupSettings: (settings: IMinecraftBackupSettings) =>
    write<IMinecraftResult & { settings?: IMinecraftBackupSettings }>(
      doc.backupSettingsSave,
      'adminMinecraftBackupSettingsSave',
      { settings }
    ),
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
  messagePlayer: (serverId: string, name: string, message: string, mode: 'chat' | 'title') =>
    write<IMinecraftResult>(doc.messagePlayer, 'adminMinecraftMessagePlayer', {
      serverId,
      name,
      message,
      mode,
    }),
  broadcast: (serverId: string, message: string, mode: 'chat' | 'title') =>
    write<IMinecraftResult>(doc.broadcast, 'adminMinecraftBroadcast', { serverId, message, mode }),
  restart: (serverId: string) =>
    write<IMinecraftResult>(doc.restart, 'adminMinecraftRestart', { serverId }),
  worldSettings: (serverId: string) =>
    run<IMinecraftResult & { settings?: IMinecraftWorldSettings }>(
      () =>
        client().query({
          query: doc.worldGet as never,
          variables: { serverId },
          fetchPolicy: 'no-cache',
        }),
      'adminMinecraftWorldGet'
    ),
  saveWorldSettings: (serverId: string, settings: IMinecraftWorldSettings) =>
    write<IMinecraftResult & { restartRequired?: boolean }>(
      doc.worldSave,
      'adminMinecraftWorldSave',
      { serverId, settings }
    ),
  bdsStatus: () =>
    read<IMinecraftResult & { status?: IMinecraftBdsStatus }>(
      doc.bdsStatus,
      'adminMinecraftBdsStatus'
    ),
  bdsInstall: () => write<IMinecraftResult>(doc.bdsInstall, 'adminMinecraftBdsInstall'),
  gamerules: (serverId: string) =>
    run<IMinecraftResult & { rules?: IMinecraftGamerules }>(
      () =>
        client().query({
          query: doc.gameruleList as never,
          variables: { serverId },
          fetchPolicy: 'no-cache',
        }),
      'adminMinecraftGameruleList'
    ),
  setGamerule: (serverId: string, name: string, value: boolean) =>
    write<IMinecraftResult>(doc.gameruleSet, 'adminMinecraftGameruleSet', {
      serverId,
      name,
      value,
    }),
  passes: () =>
    read<IMinecraftResult & { passes?: IMinecraftPass[] }>(doc.passes, 'adminMinecraftPasses'),
  players: () =>
    read<IMinecraftResult & { players?: IMinecraftPlayer[] }>(doc.players, 'adminMinecraftPlayers'),
  blockPass: (id: string, blocked: boolean) =>
    write<IMinecraftResult>(doc.blockPass, 'adminMinecraftBlockPass', { id, blocked }),
  createPass: (gamertag: string) =>
    write<IMinecraftResult>(doc.createPass, 'adminMinecraftCreatePass', { gamertag }),
  deletePass: (id: string) =>
    write<IMinecraftResult>(doc.deletePass, 'adminMinecraftDeletePass', { id }),
};
