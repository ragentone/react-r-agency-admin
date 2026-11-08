/** One stored client debug report (runtime `shared/debug`, storage `debug_report`). */
export interface IDebugReport {
  id: string;
  /** ISO time the row was created. */
  createdAt: string;
  /** ISO time the runtime received the event. */
  reportedAt: string;
  deviceId: string;
  level: string;
  tag: string;
  message: string;
  error: string;
  /** Sender: frontend, admin, app (`unknown` for older clients). */
  source: string;
}

/** Sortable columns of the list: time (`createdAt`) and level. */
export type DebugSortField = 'createdAt' | 'level';
export type DebugSortDir = 'asc' | 'desc';
