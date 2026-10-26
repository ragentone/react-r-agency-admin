import { useSearchUi } from './store';
import type {
  ISearchGroupConfig,
  ISearchHandler,
  ISearchHandlerContext,
  ISearchItem,
  ISearchManager,
} from './types';

const handlers = new Map<string, ISearchHandler>();
const groups = new Map<string, ISearchGroupConfig>();

/**
 * Search registry. Modules tell the search how to open their hits (`emit`) and how their
 * result groups look:
 *
 * ```ts
 * Core.search.registerHandler({ emit: 'user::show_profile', handle: (item, { router }) => … });
 * Core.search.registerGroup({ name: 'user', label: 'search:groups.user', icon: UserRound, roundImage: true });
 * ```
 */
export const SearchManager: ISearchManager = {
  registerHandler(handler) {
    handlers.set(handler.emit, handler);
    return () => {
      if (handlers.get(handler.emit) === handler) handlers.delete(handler.emit);
    };
  },
  getHandler: emit => (emit ? handlers.get(emit) : undefined),
  registerGroup(group) {
    groups.set(group.name, group);
  },
  getGroup: name => groups.get(name),
  open: term => useSearchUi.getState().setOpen(true, term),
  close: () => useSearchUi.getState().setOpen(false),
};

/** Runs what a hit does: its registered `emit` handler, otherwise its `route`. */
export const executeSearchItem = (item: ISearchItem, ctx: ISearchHandlerContext) => {
  const handler = SearchManager.getHandler(item.emit);
  if (handler) {
    handler.handle(item, ctx);
  } else if (item.route?.path) {
    void ctx.router.navigate({
      to: item.route.path as '/',
      search: (item.route.query ?? undefined) as never,
    });
  }
};
