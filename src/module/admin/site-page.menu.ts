import { Core } from '@core/core.api.ts';
import { FileText } from 'lucide-react';

import { SITE_PAGE_MENU_SECTION, SITE_PAGE_MENU_SECTION_ORDER, sitePagePath } from './const';
import type { ISitePageMenuItem } from './types';

const ID_PREFIX = 'site-page:';
let registered: string[] = [];
const listeners = new Set<() => void>();

Core.menu.registerSection(SITE_PAGE_MENU_SECTION, {
  label: 'admin:menu.pagesSection',
  sortOrder: SITE_PAGE_MENU_SECTION_ORDER,
});

/** Replaces the entries of the "Pages" group with the given pages. */
export const setSitePageMenu = (items: ISitePageMenuItem[]) => {
  const next = items.map(item => `${ID_PREFIX}${item.id}`);
  registered.filter(id => !next.includes(id)).forEach(id => Core.menu.unregister(id));
  items.forEach((item, index) => {
    Core.menu.register({
      id: `${ID_PREFIX}${item.id}`,
      label: item.title,
      description: item.summary || undefined,
      icon: FileText,
      to: sitePagePath(item.slug),
      section: SITE_PAGE_MENU_SECTION,
      audience: 'all',
      exact: true,
      // Keeps the backend order (menuOrder, title) stable inside the section.
      sortOrder: index,
    });
  });
  registered = next;
};

/** Asks the menu loader to fetch the pages again (after create / update / delete). */
export const refreshSitePageMenu = () => listeners.forEach(listener => listener());

export const onSitePageMenuRefresh = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
