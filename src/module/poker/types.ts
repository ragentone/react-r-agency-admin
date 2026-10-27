/** Same shapes as the runtime (apps/poker/types). */

export interface IPokerAdminResult {
  success: boolean;
  error?: string;
  /** Settings: first invalid field (`stakes.2.bb`). */
  field?: string;
}

export interface IPokerStakeSetting {
  id: string;
  enabled: boolean;
  sb: number;
  bb: number;
  minBuyIn: number;
  maxBuyIn: number;
  seats: number;
  rakePercent: number;
  rakeCap: number;
}

export interface IPokerSngSetting {
  id: string;
  enabled: boolean;
  players: number;
  buyIn: number;
  fee: number;
  chips: number;
  levelMinutes: number;
  payouts: number[];
}

export interface IPokerFreerollSetting {
  enabled: boolean;
  hour: number;
  minute: number;
  timeZone: string;
  registerMinutes: number;
  minPlayers: number;
  maxPlayers: number;
  chips: number;
  levelMinutes: number;
  prizePerPlayer: number;
  minPool: number;
  maxPool: number;
}

export interface IPokerSettings {
  stakes: IPokerStakeSetting[];
  sngs: IPokerSngSetting[];
  freeroll: IPokerFreerollSetting;
}

export interface IPokerAdminPlayer {
  userId: string;
  alias: string;
  seat: number;
  stack: number;
  sittingOut: boolean;
  connected: boolean;
}

export interface IPokerAdminTable {
  tableId: string;
  stakeId: string;
  sb: number;
  bb: number;
  seats: number;
  handNo: number;
  running: boolean;
  chips: number;
  players: IPokerAdminPlayer[];
}

export interface IPokerAdminTournament {
  id: string;
  kind: 'sng' | 'freeroll';
  configId: string;
  status: 'registering' | 'running' | 'finished' | 'cancelled';
  entrants: number;
  left: number;
  tables: number;
  prizePool: number;
  level: number;
  startsAt: number | null;
  startedAt: number | null;
}

export interface IPokerAdminOverview {
  escrow: number;
  tables: IPokerAdminTable[];
  tournaments: IPokerAdminTournament[];
  today: {
    hands: number;
    rake: number;
    reasons: Array<{ reason: string; amount: number; count: number }>;
  };
}

export interface IPokerAdminHandPlayer {
  userId: string;
  alias: string;
  seat: number;
  start: number;
  end: number;
  won: number;
  folded: boolean;
  cards: string[];
}

export interface IPokerAdminHandRow {
  handId: string;
  tableId: string;
  kind: 'cash' | 'tournament';
  stakeId: string;
  pot: number;
  rake: number;
  showdown: boolean;
  createdAt: string;
  players: IPokerAdminHandPlayer[];
}

export interface IPokerAdminHand extends IPokerAdminHandRow {
  board: string[];
  actions: Array<{ street: string; seat: number; alias: string; type: string; amount: number }>;
}

export interface IPokerAdminPair {
  a: { userId: string; alias: string };
  b: { userId: string; alias: string };
  hands: number;
  aToB: number;
  bToA: number;
  net: number;
  oneSided: number;
  flagged: boolean;
}
