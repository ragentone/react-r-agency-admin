export type MinecraftQuestStatus = 'draft' | 'active' | 'ended';

/** `signal` meldet später das Behavior Pack; leer = Schritt nur per Admin abhakbar. */
export interface IMinecraftQuestStep {
  text: string;
  signal: string;
}

export interface IMinecraftQuestReward {
  item: string;
  amount: number;
}

/** Sprache der Meldungen an die Spieler. */
export type MinecraftQuestLang = 'de' | 'en' | 'ru';

export interface IMinecraftQuestInput {
  title: string;
  intro: string;
  lang: MinecraftQuestLang;
  steps: IMinecraftQuestStep[];
  reward: IMinecraftQuestReward | null;
}

/** Aufgabe eines Servers mit Zählern (`players` = haben sie gesehen, `finished` = geschafft). */
export interface IMinecraftQuest extends IMinecraftQuestInput {
  id: string;
  serverId: string;
  status: MinecraftQuestStatus;
  createdAt: string;
  players: number;
  finished: number;
}

/** Erlaubte Belohnung (feste Liste des Backends). */
export interface IMinecraftQuestItem {
  item: string;
  label: string;
}

export interface IMinecraftQuestProgress {
  xuid: string;
  gamertag: string | null;
  alias: string | null;
  /** Anzahl erledigter Schritte. */
  step: number;
  doneAt: string | null;
  online: boolean;
}

export const QUEST_MAX_STEPS = 10;
