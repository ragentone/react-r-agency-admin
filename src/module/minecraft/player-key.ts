import type { IMinecraftPlayer } from './types';

/** Stabiler Schlüssel einer Zeile: Pass-ID, sonst der Gamertag (Spieler ohne Eintrag). */
export const playerKey = (player: IMinecraftPlayer): string =>
  player.id ?? `unlisted:${player.gamertag.toLowerCase()}`;
