import {
  type IShopCustomer,
  type IShopRequest,
  SHOP_REQUEST_OPEN_STATUSES,
} from '../types/request';

/** Display name of the sender: user alias, guest name, or the fallback label. */
export const requestName = (request: IShopRequest, fallback: string): string =>
  request.requesterAlias || request.contactName || fallback;

/** Same customer for all requests: user id, or lower-case e-mail of a guest. */
export const requestCustomerKey = (request: IShopRequest): string =>
  request.requesterId ?? `mail:${(request.contactEmail ?? '').toLowerCase()}`;

/** Euro text of an amount in cents, e.g. "1.250 €". */
export const formatCents = (cents: number, language: string): string =>
  new Intl.NumberFormat(language, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);

/** Cents from an input like "49,90" – `null` when empty, `undefined` when not a valid amount. */
export const parseEuroToCents = (text: string): number | null | undefined => {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const euro = Number(trimmed.replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(euro) || euro < 0 || euro > 20_000_000) return undefined;
  return Math.round(euro * 100);
};

/** Sum of the values of the given requests, in cents. */
export const sumCents = (requests: IShopRequest[]): number =>
  requests.reduce((sum, request) => sum + (request.valueCents ?? 0), 0);

/** Search over name, e-mail, service and message (case-insensitive). */
export const matchesRequestSearch = (
  request: IShopRequest,
  query: string,
  fallbackName: string
): boolean => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [
    requestName(request, fallbackName),
    request.contactEmail,
    request.itemTitle,
    request.message,
  ]
    .filter(Boolean)
    .some(value => String(value).toLowerCase().includes(needle));
};

/** Groups requests by customer, newest activity first. */
export const groupCustomers = (requests: IShopRequest[], fallbackName: string): IShopCustomer[] => {
  const map = new Map<string, IShopCustomer>();
  for (const request of requests) {
    const key = requestCustomerKey(request);
    const at = request.updatedAt ?? request.createdAt ?? '';
    const customer = map.get(key) ?? {
      key,
      name: requestName(request, fallbackName),
      email: request.contactEmail,
      avatarUrl: request.requesterAvatarUrl ?? null,
      isMember: Boolean(request.requesterId),
      requests: [],
      lastAt: at,
      wonCents: 0,
      openCents: 0,
    };
    customer.requests.push(request);
    if (at > customer.lastAt) customer.lastAt = at;
    if (request.status === 'won') customer.wonCents += request.valueCents ?? 0;
    if (SHOP_REQUEST_OPEN_STATUSES.includes(request.status)) {
      customer.openCents += request.valueCents ?? 0;
    }
    map.set(key, customer);
  }
  return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
};
