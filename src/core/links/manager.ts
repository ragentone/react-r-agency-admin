import { LINK_GROUP_DEFAULT, LINK_GROUP_LEGAL } from './const.ts';
import { useLinkOpenStore } from './store.ts';
import type { ILinkEntry, ILinkGroupConfig, ILinkManager } from './types.ts';

const entries = new Map<string, ILinkEntry>();
const groups: Record<string, ILinkGroupConfig> = {
  [LINK_GROUP_LEGAL]: { label: 'links:groups.legal', sortOrder: 0 },
  [LINK_GROUP_DEFAULT]: { label: 'links:groups.links', sortOrder: 100 },
};
const listeners = new Set<() => void>();
let version = 0;
let sorted: ILinkEntry[] = [];

const changed = () => {
  version += 1;
  sorted = [...entries.values()].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id.localeCompare(b.id)
  );
  listeners.forEach(listener => listener());
};

/** Group of a link: explicit `group`, else `legal` for legal kinds, else `links`. */
export const linkGroupOf = (entry: ILinkEntry): string =>
  entry.group ?? (entry.kind && entry.kind !== 'custom' ? LINK_GROUP_LEGAL : LINK_GROUP_DEFAULT);

/**
 * Link manager (core): imprint, terms, privacy and custom links. Shown in the links menu
 * (menu footer → "Legal & links"), content opens as a page (`/link/<id>`).
 *
 * ```ts
 * // apps/timeline/app.tsx
 * Core.links.registerGroup('timeline', { label: 'timeline:links.group', sortOrder: 50 });
 * Core.links.register({
 *   id: 'timeline:terms',
 *   kind: 'terms',
 *   group: 'timeline',
 *   label: 'timeline:links.terms',
 *   content: { type: 'lazy', load: () => import('./legal/TimelineTerms.tsx') },
 * });
 * Core.links.register({
 *   id: 'timeline:help',
 *   label: 'timeline:links.help',
 *   content: { type: 'url', url: 'https://example.com/help' },
 * });
 *
 * Core.links.open('timeline:terms'); // anywhere → /link/timeline%3Aterms
 * ```
 */
const LinkManager: ILinkManager = {
  register(entry) {
    entries.set(entry.id, entry);
    changed();
    return () => {
      if (entries.get(entry.id) === entry) LinkManager.unregister(entry.id);
    };
  },
  unregister(id) {
    if (entries.delete(id)) changed();
  },
  get: id => entries.get(id),
  getEntries: () => sorted,
  registerGroup(id, config) {
    groups[id] = config;
    changed();
  },
  getGroups: () => groups,
  open(id) {
    const entry = entries.get(id);
    if (entry?.content.type === 'url') {
      window.open(entry.content.url, '_blank', 'noopener,noreferrer');
      return;
    }
    useLinkOpenStore.getState().request(id);
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getVersion: () => version,
};

export { LinkManager };
