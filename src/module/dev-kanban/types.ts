export const DEV_TODO_STATUSES = ['open', 'in_progress', 'review', 'done'] as const;
export const DEV_TODO_PRIORITIES = ['low', 'normal', 'high'] as const;
export const DEV_TODO_TITLE_MAX = 200;
export const DEV_TODO_DESCRIPTION_MAX = 5000;
export const DEV_TODO_SUMMARY_MAX = 300;

export type DevTodoStatus = (typeof DEV_TODO_STATUSES)[number];
export type DevTodoPriority = (typeof DEV_TODO_PRIORITIES)[number];

/** Todo as sent by the backend (`IDeveloperTodoData`), fields used by the board. */
export interface IDevTodo {
  id: string;
  title: string;
  summary: string;
  description: string;
  status: DevTodoStatus;
  priority: DevTodoPriority;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: IDevTodoActor | null;
  updatedBy?: IDevTodoActor | null;
  doneAt: string | null;
}

export interface IDevTodoValues {
  title: string;
  summary: string;
  description: string;
  status: DevTodoStatus;
  priority: DevTodoPriority;
}

/** Who created or last changed a todo (id plus alias at that time). */
export interface IDevTodoActor {
  id: string;
  alias: string | null;
  avatarUrl?: string | null;
}

/** Jira-like workflow: a status may only change along these transitions (same as the backend). */
export const DEV_TODO_TRANSITIONS: Record<DevTodoStatus, readonly DevTodoStatus[]> = {
  open: ['in_progress', 'done'],
  in_progress: ['open', 'review', 'done'],
  review: ['in_progress', 'done'],
  done: ['open'],
};

export const canDevTodoTransition = (from: DevTodoStatus, to: DevTodoStatus) =>
  from === to || DEV_TODO_TRANSITIONS[from].includes(to);
