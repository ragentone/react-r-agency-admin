import React, { useEffect } from 'react';

import { useLinkRoute } from '../hooks';
import { useLinkOpenStore } from '../store.ts';

/**
 * Mounted once by `LinkProvider` (inside the router). Moves requests from outside React
 * (`Core.links.open`) into the router → `/link/<id>`, and redirects legacy drawer links
 * (`?link=<id>`) to the link page.
 */
export const LinkRouteHost: React.FC = () => {
  const { legacyId, openLink } = useLinkRoute();
  const requested = useLinkOpenStore(state => state.requested);
  const clearRequest = useLinkOpenStore(state => state.clearRequest);

  useEffect(() => {
    if (!requested) return;
    clearRequest();
    openLink(requested);
  }, [requested, clearRequest, openLink]);

  useEffect(() => {
    if (legacyId) openLink(legacyId, { replace: true });
  }, [legacyId, openLink]);

  return null;
};
