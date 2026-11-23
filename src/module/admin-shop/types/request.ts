/** Pipeline of a request: new → in progress → offer sent → won / lost. */
export type ShopRequestStatus = 'new' | 'progress' | 'offer' | 'won' | 'lost';
export const SHOP_REQUEST_STATUSES: ShopRequestStatus[] = [
  'new',
  'progress',
  'offer',
  'won',
  'lost',
];
/** Stages that still need work. */
export const SHOP_REQUEST_OPEN_STATUSES: ShopRequestStatus[] = ['new', 'progress', 'offer'];

/** Max. lengths of a request (same as the backend). */
export const SHOP_REQUEST_MESSAGE_MAX = 1000;
export const SHOP_REQUEST_NAME_MAX = 80;
export const SHOP_REQUEST_EMAIL_MAX = 120;

/** One request on a page service (owner view). */
export interface IShopRequest {
  id: string;
  shopId: string;
  itemId: string;
  itemTitle: string;
  message: string;
  contactName: string | null;
  contactEmail: string | null;
  requesterId: string | null;
  status: ShopRequestStatus;
  /** Job value in cents set by the page team. */
  valueCents: number | null;
  /** Name and avatar of a signed-in requester (page team view). */
  requesterAlias?: string | null;
  requesterAvatarUrl?: string | null;
  createdAt: string | null;
  updatedAt?: string | null;
}

/** Max. length of a reply (same as the backend). */
export const SHOP_REPLY_MESSAGE_MAX = 1000;

/** One answer inside a request; `fromRequester` tells which side wrote it. */
export interface IShopRequestReply {
  id: string;
  requestId: string;
  message: string;
  fromRequester: boolean;
  createdAt: string | null;
}

/** Who looks at a request: the page team (owner, moderators) or the requester. */
export type ShopRequestViewer = 'team' | 'requester';

/** Internal note of the page team (never shown to the requester). */
export interface IShopRequestNote {
  id: string;
  requestId: string;
  message: string;
  mine: boolean;
  createdAt: string | null;
}

export const SHOP_NOTE_MESSAGE_MAX = 1000;

/** One customer: all requests of one person (signed-in user or guest by e-mail). */
export interface IShopCustomer {
  key: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  isMember: boolean;
  requests: IShopRequest[];
  /** Newest activity (ISO), for sorting. */
  lastAt: string;
  wonCents: number;
  openCents: number;
}
