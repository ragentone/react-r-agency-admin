import { AppDialog } from '@ui/components/AppDialog';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { useRef } from 'react';

import { PluginBoundary } from './PluginBoundary';
import { usePluginDialogStore } from './plugin.dialog';
import { LOADING_BACKDROP_CLASS, type IPluginLoadingOptions } from './plugin.loading';
import type { IPluginDialogComponent } from './plugin.types';

/** Renders the dialog of `api.openDialog`. Mounted once in the app root. */
export const PluginDialogHost = () => {
  const request = usePluginDialogStore(state => state.request);
  const loading = usePluginDialogStore(state => state.loading);
  const close = usePluginDialogStore(state => state.close);
  const setLoading = usePluginDialogStore(state => state.setLoading);

  // Keep the last dialog while it closes, so its content does not vanish mid-animation.
  const lastRequest = useRef(request);
  if (request) lastRequest.current = request;
  const shown = request ?? lastRequest.current;

  // The plugin calls `loading(state, { text, backdrop })`.
  const loadingFn = (state: boolean, options?: IPluginLoadingOptions) => setLoading(state, options);

  // Renders one plugin part (body, header slot, footer) with the same props. A part that throws hides itself.
  const part = (Part: IPluginDialogComponent | undefined) =>
    Part && shown ? (
      <PluginBoundary pluginId={shown.pluginId}>
        <Part {...shown.props} close={close} loading={loadingFn} />
      </PluginBoundary>
    ) : undefined;

  return (
    <AppDialog
      open={request !== undefined}
      // While loading, the user cannot close the dialog (X, Escape, outside click, back).
      onOpenChange={next => {
        if (!next && !loading.active) close();
      }}
      title={shown?.title ?? ''}
      description={shown?.description}
      size={shown?.size ?? 'md'}
      backClose={shown?.backClose ?? false}
      rounded={shown?.rounded ?? false}
      headerStart={part(shown?.headerStart)}
      headerEnd={part(shown?.headerEnd)}
      footer={part(shown?.footer)}
      overlay={
        loading.active && (
          <div
            role="status"
            aria-live="polite"
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 ${LOADING_BACKDROP_CLASS[loading.backdrop ?? 'blur']}`}
          >
            <Spinner className="size-10" />
            {loading.text && (
              <p className="text-body animate-pulse">{loading.text}</p>
            )}
          </div>
        )
      }
    >
      {part(shown?.component)}
    </AppDialog>
  );
};
