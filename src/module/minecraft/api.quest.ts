import { parse } from 'graphql';

import { client, type IMinecraftResult, run, write } from './api';
import type {
  IMinecraftQuest,
  IMinecraftQuestInput,
  IMinecraftQuestItem,
  IMinecraftQuestProgress,
  MinecraftQuestStatus,
} from './types.quest';

const doc = {
  list: parse(
    `query AdminMinecraftQuestList($serverId: String!) { adminMinecraftQuestList(serverId: $serverId) { success error quests items } }`
  ),
  progress: parse(
    `query AdminMinecraftQuestProgress($id: String!) { adminMinecraftQuestProgress(id: $id) { success error progress } }`
  ),
  save: parse(
    `mutation AdminMinecraftQuestSave($serverId: String!, $id: String, $quest: JSON!) { adminMinecraftQuestSave(serverId: $serverId, id: $id, quest: $quest) { success error } }`
  ),
  setStatus: parse(
    `mutation AdminMinecraftQuestSetStatus($id: String!, $status: String!) { adminMinecraftQuestSetStatus(id: $id, status: $status) { success error } }`
  ),
  remove: parse(
    `mutation AdminMinecraftQuestDelete($id: String!) { adminMinecraftQuestDelete(id: $id) { success error } }`
  ),
  advance: parse(
    `mutation AdminMinecraftQuestAdvance($id: String!, $gamertag: String!) { adminMinecraftQuestAdvance(id: $id, gamertag: $gamertag) { success error } }`
  ),
};

const query = <T extends IMinecraftResult>(document: unknown, field: string, variables: object) =>
  run<T>(
    () => client().query({ query: document as never, variables, fetchPolicy: 'no-cache' }),
    field
  );

/** Aufgabensystem, Admin only (`admin:user`, geprüft in runtime `apps/minecraft`). */
export const AdminMinecraftQuestApi = {
  list: (serverId: string) =>
    query<IMinecraftResult & { quests?: IMinecraftQuest[]; items?: IMinecraftQuestItem[] }>(
      doc.list,
      'adminMinecraftQuestList',
      { serverId }
    ),
  progress: (id: string) =>
    query<IMinecraftResult & { progress?: IMinecraftQuestProgress[] }>(
      doc.progress,
      'adminMinecraftQuestProgress',
      { id }
    ),
  save: (serverId: string, id: string | null, quest: IMinecraftQuestInput) =>
    write<IMinecraftResult>(doc.save, 'adminMinecraftQuestSave', { serverId, id, quest }),
  setStatus: (id: string, status: Exclude<MinecraftQuestStatus, 'draft'>) =>
    write<IMinecraftResult>(doc.setStatus, 'adminMinecraftQuestSetStatus', { id, status }),
  remove: (id: string) => write<IMinecraftResult>(doc.remove, 'adminMinecraftQuestDelete', { id }),
  advance: (id: string, gamertag: string) =>
    write<IMinecraftResult>(doc.advance, 'adminMinecraftQuestAdvance', { id, gamertag }),
};
