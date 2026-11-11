import { AppDialog } from '@ui/components/AppDialog';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { useRef } from 'react';

import { PluginBoundary } from './PluginBoundary';
import { usePluginDialogStore } from './plugin.dialog';

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
  const Component = shown?.component;

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
      overlay={
        loading.active && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm"
          >
            <Spinner className="size-6" />
            {loading.text && <p className="text-body text-muted-foreground">{loading.text}</p>}
          </div>
        )
      }
    >
      {shown && Component && (
        // A plugin component that throws hides itself; the app keeps working.
        <PluginBoundary pluginId={shown.pluginId}>
          <Component {...shown.props} close={close} loading={setLoading} />
        </PluginBoundary>
      )}
    </AppDialog>
  );
};
