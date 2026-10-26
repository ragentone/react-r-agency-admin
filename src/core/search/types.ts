import type { useRouter } from '@tanstack/react-router';
import type { ComponentType, SVGProps } from 'react';

/** Bundle = one backend search resolver (`searchConfig.bundles`). */
export interface ISearchBundle {
  alias: string;
  /** Backend translate key, e.g. `user.search.bundle_label`. */
  label: string;
  active: boolean;
  sortOrder: number;
}

/** One hit (backend `ISearchResultItem`). */
export interface ISearchItem {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  payload?: Record<string, unknown> | null;
  /** Action key – handled by a registered handler (see `SearchManager.registerHandler`). */
  emit?: string | null;
  component?: string | null;
  tooltip?: string | null;
  date?: string | null;
  group: string;
  route?: { path: string; query?: Record<string, string> | null } | null;
}

export interface ISearchGroup {
  name: string;
  label: string;
  items: ISearchItem[];
}

export interface ISearchResult {
  groups: ISearchGroup[];
  total: number;
  hrtime: string;
  isEmpty: boolean;
}

export interface ISearchHandlerContext {
  router: ReturnType<typeof useRouter>;
}

/** What happens when a hit with this `emit` is selected. */
export interface ISearchHandler {
  emit: string;
  handle: (item: ISearchItem, ctx: ISearchHandlerContext) => void;
}

export type SearchIcon = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;

/** Display of a result group (`item.group`). */
export interface ISearchGroupConfig {
  name: string;
  /** Translation key (`ns:key`) or plain text. */
  label: string;
  icon?: SearchIcon;
  /** Round images (people) instead of rounded squares. */
  roundImage?: boolean;
  sortOrder?: number;
}

export interface ISearchManager {
  registerHandler(handler: ISearchHandler): () => void;
  getHandler(emit?: string | null): ISearchHandler | undefined;
  registerGroup(group: ISearchGroupConfig): void;
  getGroup(name: string): ISearchGroupConfig | undefined;
  /** Open / close the search dialog from anywhere. */
  open(term?: string): void;
  close(): void;
}
