import type { IPageBlockDefinition, IPageBlockManager } from './types.ts';

/** `<app>:<name>` – built-in blocks of the page editor have no prefix. */
export const PAGE_BLOCK_TYPE_PATTERN = /^[a-z0-9][a-z0-9-]{0,30}:[a-z0-9][a-z0-9-]{0,40}$/;

const definitions = new Map<string, IPageBlockDefinition>();
const listeners = new Set<() => void>();
let version = 0;
let sorted: IPageBlockDefinition[] = [];

const changed = () => {
  version += 1;
  sorted = [...definitions.values()].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.type.localeCompare(b.type)
  );
  listeners.forEach(listener => listener());
};

/**
 * Registry of app blocks for dynamic pages (admin → pages). Apps register from `app.tsx`:
 *
 * ```ts
 * Core.blocks.register({
 *   type: 'timeline:best',
 *   label: 'timeline:block.best.label',
 *   icon: Trophy,
 *   defaults: () => ({ title: '', limit: '6' }),
 *   fields: [{ key: 'title', kind: 'text', label: 'timeline:block.best.title', max: 150 }],
 *   render: lazy(() => import('./blocks/TimelineBestBlock.tsx')),
 * });
 * ```
 *
 * The backend must know the same type + fields (runtime: CAN bus `site-page` →
 * `collect_blocks`), otherwise saving a page with that block is refused.
 * See `src/core/blocks/README.md`.
 */
export const PageBlockManager: IPageBlockManager = {
  register(definition) {
    if (!PAGE_BLOCK_TYPE_PATTERN.test(definition.type)) {
      throw new Error(`Core.blocks: invalid type "${definition.type}" (use "<app>:<name>")`);
    }
    const entry = definition as unknown as IPageBlockDefinition;
    definitions.set(definition.type, entry);
    changed();
    return () => {
      if (definitions.get(definition.type) === entry) PageBlockManager.unregister(definition.type);
    };
  },
  unregister(type) {
    if (definitions.delete(type)) changed();
  },
  get: type => definitions.get(type),
  list: () => sorted,
  subscribe(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getVersion: () => version,
};
