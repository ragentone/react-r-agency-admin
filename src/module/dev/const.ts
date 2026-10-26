/** Dev area – full screen page over the start page. (`/dev` is the file route of _admin/dev.) */
export const DEV_ROUTE = '/developer';
/** Who may use it (any of them) – same check as the backend (apps/developer). */
export const DEV_ROLES = ['admin:user', 'dev:user'];

export const DEV_TODO_TITLE_MAX = 200;
export const DEV_TODO_DESCRIPTION_MAX = 5000;

export const DEV_TODO_STATUSES = ['open', 'in_progress', 'done'] as const;
export const DEV_TODO_PRIORITIES = ['low', 'normal', 'high'] as const;

/** Public page: roadmap + tickets of the signed-in user. */
export const ROADMAP_ROUTE = '/roadmap';

export const TICKET_TYPES = ['bug', 'feature', 'idea'] as const;
export const TICKET_STATUSES = ['pending', 'accepted', 'rejected'] as const;
export const TICKET_TITLE_MAX = 120;
export const TICKET_DESCRIPTION_MAX = 2000;
export const TICKET_NOTE_MAX = 1000;
/** Same as the backend (DEVELOPER_TICKET_MAX_PENDING). */
export const TICKET_MAX_PENDING = 5;
