import { useTranslation } from 'react-i18next';

import type { FriendsFilter, IFriendListItem } from '../types';
import { formatRelativeDate, formatShortDate } from '../utils';

/** Subtitle: online state for friends, otherwise when the relation started. */
export const useFriendSubtitle = (item: IFriendListItem, filter: FriendsFilter) => {
  const { t, i18n } = useTranslation('friends');
  const locale = i18n.resolvedLanguage ?? i18n.language;
  if (filter === 'blocked') return t('since.blocked');
  if (filter === 'accepted') {
    if (item.online) return t('online');
    const date = formatShortDate(item.relation.createdAt, locale);
    return date ? t('since.accepted', { date }) : null;
  }
  const date = formatRelativeDate(item.relation.createdAt, locale);
  return date ? t(`since.${filter}`, { date }) : null;
};
