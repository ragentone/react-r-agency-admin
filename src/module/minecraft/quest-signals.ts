/**
 * Signale, die das Behavior Pack (`behavior-packs/quest-log`) meldet. Ein Schritt wählt eines
 * davon; der Text kommt aus `quest.signal.<signal>` in den Locales. Bei Änderung auch
 * `services/quest/quest-messages.ts` im Backend anpassen.
 */
export const QUEST_SIGNALS = [
  'kill_zombie',
  'kill_skeleton',
  'kill_creeper',
  'kill_spider',
  'kill_enderman',
  'kill_witch',
  'kill_slime',
  'break_diamond_ore',
  'break_iron_ore',
  'break_coal_ore',
  'break_gold_ore',
  'break_redstone_ore',
  'break_lapis_ore',
  'break_emerald_ore',
  'break_oak_log',
  'break_birch_log',
  'break_sand',
  'use_compass',
  'use_bow',
  'use_fishing_rod',
  'use_bucket',
  'use_map',
] as const;

export type QuestSignal = (typeof QUEST_SIGNALS)[number];
