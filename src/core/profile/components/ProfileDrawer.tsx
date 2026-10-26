import { useRouter, useRouterState } from '@tanstack/react-router';
import { Drawer, DrawerContent, DrawerTitle } from '@ui/shad-cn/components/drawer.tsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getProfileDrawerId, withoutProfileDrawerParam } from '../const';
import { useProfileDrawer, useProfileDrawerStore } from '../hooks/use.profile.drawer';
import { ProfileView } from './ProfileView';

export interface IProfileDrawerProps {
  /** Profile to show (null = closed). */
  userId: string | null;
  onClose: () => void;
}

/**
 * Profile as bottom sheet (no routing). Rendered inside another drawer it stacks on top of it
 * (base-ui nested drawers), e.g. the friends drawer stays below and is back after closing.
 * Closes itself when the route changes (e.g. "Edit profile" → account).
 */
export const ProfileDrawer: React.FC<IProfileDrawerProps> = ({ userId, onClose }) => {
  const { t } = useTranslation('profile');
  const pathname = useRouterState({ select: state => state.location.pathname });

  // Keep the last profile while the close animation runs.
  const [shownId, setShownId] = useState(userId);
  if (userId && userId !== shownId) setShownId(userId);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const open = Boolean(userId);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    if (openRef.current) onCloseRef.current();
  }, [pathname]);

  return (
    <Drawer open={open} onOpenChange={next => !next && onClose()} showSwipeHandle>
      <DrawerContent className="mx-auto w-full max-w-[640px] [--drawer-height:94dvh] sm:[--drawer-height:88dvh]">
        <DrawerTitle className="sr-only">{t('title')}</DrawerTitle>
        <div
          data-slot="profile-drawer"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]"
        >
          {shownId && (
            <ProfileView key={shownId} userId={shownId} onBack={onClose} variant="drawer" />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

/**
 * Global profile drawer (mounted by ProfileProvider), driven by `openProfileDrawer()` /
 * `openProfile(router, id, 'drawer')` or by `?profile-id=<id>` on any page (link, reload,
 * back / forward). Closing removes the parameter again; the parameter going away
 * (browser back) closes the drawer.
 */
export const ProfileDrawerHost: React.FC = () => {
  const router = useRouter();
  const { openProfileId, closeProfile } = useProfileDrawer();
  const searchStr = useRouterState({ select: state => state.location.searchStr });
  const paramId = getProfileDrawerId(searchStr);
  const lastParamRef = useRef<string | null>(null);

  useEffect(() => {
    const last = lastParamRef.current;
    lastParamRef.current = paramId;
    const { userId: current, open, close } = useProfileDrawerStore.getState();
    if (paramId) {
      if (current !== paramId) open(paramId);
    } else if (last && current === last) {
      close();
    }
  }, [paramId]);

  const onClose = useCallback(() => {
    closeProfile();
    const { pathname, searchStr: search, hash } = router.state.location;
    if (!getProfileDrawerId(search)) return;
    router.history.replace(
      `${pathname}${withoutProfileDrawerParam(search)}${hash ? `#${hash}` : ''}`
    );
  }, [closeProfile, router]);

  return <ProfileDrawer userId={openProfileId} onClose={onClose} />;
};
