import { useCallback, useEffect, useState } from 'react';

import { AdminMinecraftQuestApi } from '../api.quest';
import type { IMinecraftQuest, IMinecraftQuestItem } from '../types.quest';

interface IQuestData {
  quests: IMinecraftQuest[];
  items: IMinecraftQuestItem[];
}

const load = async (serverId: string): Promise<IQuestData> => {
  const result = await AdminMinecraftQuestApi.list(serverId);
  return { quests: result.quests ?? [], items: result.items ?? [] };
};

/** Aufgaben eines Servers samt erlaubter Belohnungen; lädt beim Öffnen und auf `reload`. */
export function useQuests(serverId: string, enabled: boolean) {
  const [data, setData] = useState<IQuestData | null>(null);

  const reload = useCallback(async () => setData(await load(serverId)), [serverId]);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    void load(serverId).then(next => alive && setData(next));
    return () => {
      alive = false;
    };
  }, [enabled, serverId]);

  return { quests: data?.quests ?? null, items: data?.items ?? [], reload };
}
