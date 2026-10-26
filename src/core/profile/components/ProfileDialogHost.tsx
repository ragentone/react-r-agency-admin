import { useRouter } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { getProfilePath } from '../const';
import { useProfileRoute } from '../hooks/use.profile.route';
import { ProfileDrawerHost } from './ProfileDrawer';

/**
 * Legacy `?profile=<id>` links (former overlay) → redirect to the profile page `/profile/<id>`.
 * The profile is no longer shown as a fullscreen overlay.
 */
export const ProfileDialogHost: React.FC = () => {
  const router = useRouter();
  const { openProfileId } = useProfileRoute();

  useEffect(() => {
    if (!openProfileId) return;
    void router.navigate({ to: getProfilePath(openProfileId) as '/', replace: true });
  }, [openProfileId, router]);

  return null;
};

/**
 * Registered via ProviderManager (target `route`, core.tsx) → the host lives inside the
 * router and above every page. Also hosts the routing-free profile drawer (`openProfileDrawer`).
 */
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <ProfileDialogHost />
    <ProfileDrawerHost />
  </>
);
