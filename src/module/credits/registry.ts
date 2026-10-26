import type { LucideIcon } from 'lucide-react';

/**
 * Apps tell the credits UI how their bookings look (icon + name in the history, "how to earn"
 * and the admin area). Labels of rules / products come from the runtime catalog (i18n keys).
 *
 * ```ts
 * // apps/forum/app.tsx
 * CreditsRegistry.registerApp({ app: 'forum', label: 'forum:credits.app', icon: MessagesSquare });
 * ```
 */
export interface ICreditsAppEntry {
  /** Prefix of the keys (`forum` for `forum.post.upvoted`). */
  app: string;
  label: string;
  icon: LucideIcon;
  /** Optional link for a booking (e.g. the post it belongs to). */
  linkOf?: (reason: string, refId: string | null) => string | null;
  sortOrder?: number;
}

const apps = new Map<string, ICreditsAppEntry>();

export const CreditsRegistry = {
  registerApp(entry: ICreditsAppEntry) {
    apps.set(entry.app, entry);
  },
  app(app: string): ICreditsAppEntry | undefined {
    return apps.get(app);
  },
  apps(): ICreditsAppEntry[] {
    return [...apps.values()].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
};
