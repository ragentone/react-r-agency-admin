import { AppDrawer } from '@ui/patterns';
import { useRef } from 'react';

import { PluginBoundary } from './PluginBoundary';
import { usePluginDrawerStore } from './plugin.drawer';

/** Position of the plugin API → side the drawer slides in from. */
const DIRECTION_BY_POSITION = { bottom: 'down', top: 'up', left: 'left', right: 'right' } as const;

/** Renders the drawer of `api.openDrawer`. Mounted once in the app root. */
export const PluginDrawerHost = () => {
  const request = usePluginDrawerStore(state => state.request);
  const close = usePluginDrawerStore(state => state.close);

  // Keep the last drawer while it slides out, so its content does not vanish mid-animation.
  const lastRequest = useRef(request);
  if (request) lastRequest.current = request;
  const shown = request ?? lastRequest.current;
  const Component = shown?.component;

  return (
    <AppDrawer
      open={request !== undefined}
      onOpenChange={next => !next && close()}
      title={shown?.title ?? ''}
      description={shown?.description ?? shown?.title}
      size={shown?.size ?? 'full'}
      direction={DIRECTION_BY_POSITION[shown?.position ?? 'bottom']}
    >
      {shown && Component && (
        // A plugin component that throws hides itself; the app keeps working.
        <PluginBoundary pluginId={shown.pluginId}>
          <Component {...shown.props} close={close} />
        </PluginBoundary>
      )}
    </AppDrawer>
  );
};
