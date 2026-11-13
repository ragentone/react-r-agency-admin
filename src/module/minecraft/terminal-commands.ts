export interface ITerminalCommand {
  /** Befehl ohne Slash, so wie er an den Server geht. */
  cmd: string;
  /** Platzhalter für Argumente (leer = Befehl ohne Argumente). */
  args: string;
  /** Schlüssel der Beschreibung in `terminal.commands.<key>` (Locales). */
  key: string;
}

/** Auswahl für das Slash-Menü (Whitelist nur zur Anzeige, der Server prüft nichts nach). */
export const TERMINAL_COMMANDS: ITerminalCommand[] = [
  { cmd: 'list', args: '', key: 'list' },
  { cmd: 'say', args: '<text>', key: 'say' },
  { cmd: 'kick', args: '<name> [grund]', key: 'kick' },
  { cmd: 'allowlist add', args: '"<gamertag>"', key: 'allowlistAdd' },
  { cmd: 'allowlist remove', args: '"<gamertag>"', key: 'allowlistRemove' },
  { cmd: 'allowlist list', args: '', key: 'allowlistList' },
  { cmd: 'allowlist reload', args: '', key: 'allowlistReload' },
  { cmd: 'op', args: '<name>', key: 'op' },
  { cmd: 'deop', args: '<name>', key: 'deop' },
  { cmd: 'gamemode', args: '<modus> [name]', key: 'gamemode' },
  { cmd: 'time set', args: '<day|night|zahl>', key: 'timeSet' },
  { cmd: 'weather', args: '<clear|rain|thunder>', key: 'weather' },
  { cmd: 'gamerule', args: '<regel> [wert]', key: 'gamerule' },
  { cmd: 'save hold', args: '', key: 'saveHold' },
  { cmd: 'save query', args: '', key: 'saveQuery' },
  { cmd: 'save resume', args: '', key: 'saveResume' },
  { cmd: 'stop', args: '', key: 'stop' },
];

/** Treffer für die aktuelle Eingabe (`/al…`); leer, wenn kein Slash-Menü offen sein soll. */
export function matchCommands(value: string): ITerminalCommand[] {
  if (!value.startsWith('/')) return [];
  const query = value.slice(1).toLowerCase();
  return TERMINAL_COMMANDS.filter(item => item.cmd.startsWith(query) && item.cmd !== query);
}
