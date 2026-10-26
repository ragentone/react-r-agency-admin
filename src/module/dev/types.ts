import type {
  DEV_TODO_PRIORITIES,
  DEV_TODO_STATUSES,
  TICKET_STATUSES,
  TICKET_TYPES,
} from './const';

export type DevTodoStatus = (typeof DEV_TODO_STATUSES)[number];
export type DevTodoPriority = (typeof DEV_TODO_PRIORITIES)[number];

/** Todo as sent by the backend (`IDeveloperTodoData`). */
export interface IDevTodo {
  id: string;
  title: string;
  description: string;
  status: DevTodoStatus;
  priority: DevTodoPriority;
  createdBy: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  doneAt: string | null;
  /** Shown on the public roadmap. */
  public: boolean;
  /** Accepted user ticket this todo came from. */
  ticketId: string | null;
}

export interface IDevTodoValues {
  title: string;
  description: string;
  status: DevTodoStatus;
  priority: DevTodoPriority;
  public: boolean;
}

export type DevTodoFilter = 'active' | DevTodoStatus | 'all';

export type TicketType = (typeof TICKET_TYPES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

/** `IDeveloperTicketData` of the backend. */
export interface ITicket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  todoId: string | null;
  createdAt: string;
  /** Only in the dev list. */
  author?: { id: string; alias: string | null; avatarUrl: string | null } | null;
}

export interface ITicketValues {
  title: string;
  description: string;
  type: TicketType;
}

/** Public roadmap item (`IDeveloperRoadmapItem`) – description is plain text. */
export interface IRoadmapItem {
  id: string;
  title: string;
  description: string;
  status: DevTodoStatus;
  priority: DevTodoPriority;
  fromTicket: boolean;
  updatedAt: string;
  doneAt: string | null;
}

export type TicketFilter = TicketStatus | 'all';
