import { Spinner } from '@ui/shad-cn/components/spinner';

import { LOADING_BACKDROP_CLASS, usePluginLoadingStore } from './plugin.loading';

/** Fullscreen loading overlay of `api.loading`. Covers the whole app, above dialogs and drawers. Mounted in the root route. */
export const PluginLoadingHost = () => {
  const overlay = usePluginLoadingStore(state => state.overlay);
  if (!overlay.active) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 ${LOADING_BACKDROP_CLASS[overlay.backdrop]}`}
    >
      <Spinner className="size-10" />
      {overlay.text && (
        <p className="text-body animate-pulse">{overlay.text}</p>
      )}
    </div>
  );
};
