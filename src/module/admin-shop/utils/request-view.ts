import type { IShopRequest } from '../types/request';

/** Who sent the request: "Mitglied" for signed-in users, otherwise name and e-mail of the guest. */
export const requestFrom = (request: IShopRequest, memberLabel: string): string =>
  request.requesterId
    ? request.requesterAlias || memberLabel
    : [request.contactName, request.contactEmail].filter(Boolean).join(' · ');

/** Localized date and time of a request, empty when unknown. */
export const formatRequestDate = (value: string | null, language: string): string =>
  value
    ? new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value)
      )
    : '';
