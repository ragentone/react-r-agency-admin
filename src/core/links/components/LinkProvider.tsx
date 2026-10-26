import React from 'react';

import { LinkRouteHost } from './LinkRouteHost.tsx';
import { LinksMenuDrawer } from './LinksMenuDrawer.tsx';

/**
 * Registered via ProviderManager (target `route`, core.tsx) → lives inside the router above
 * every page: navigation to the link pages (`/link/<id>`) + links menu.
 */
export const LinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <LinkRouteHost />
    <LinksMenuDrawer />
  </>
);
