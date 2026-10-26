import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  pageImageUuid,
  useAdminPageImageDiscard,
  useAdminPageImageKeep,
} from '../hooks/use.admin.page.image';
import type { PageBlock } from './types';

/** Heartbeat interval – well below the server's cron limit of 1 h. */
const KEEP_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Images uploaded while a page is edited. Nothing may stay on the server that no page uses:
 *
 * - **Saved** → `commit(blocks)`: uploads the saved blocks don't reference (replaced, removed,
 *   block deleted) are discarded right away.
 * - **Closed without saving / unmounted** → `cancel()`: every upload of this session is
 *   discarded right away.
 * - **Tab closed / reloaded** (`pagehide`) → same as cancel, sent as keepalive request so it
 *   survives the page. Not when the page only goes into the back/forward cache (it may come
 *   back with the editor still open).
 * - **Still editing** → heartbeat every 10 minutes and when the tab becomes visible again: the
 *   server refreshes the unsaved uploads, so its cron (removes unused uploads after 1 h) keeps
 *   them. Uploads that are gone already (device slept for hours) are reported with a toast.
 *
 * Images that were already saved before are never touched here – the server removes them on
 * the next save (`adminPageUpdate`) when no page uses them any more. The server also checks
 * every discard against all pages, and the cron removes what slipped through.
 */
export interface IPageImageSession {
  /** Remember a fresh upload. */
  track: (url: string) => void;
  commit: (blocks: PageBlock[]) => void;
  cancel: () => void;
}

const PageImageSessionContext = createContext<IPageImageSession | null>(null);

export const usePageImageSession = (): IPageImageSession => {
  const { t } = useTranslation('admin');
  const discard = useAdminPageImageDiscard();
  const keep = useAdminPageImageKeep();
  const uploads = useRef(new Set<string>());

  const take = () => {
    const list = [...uploads.current];
    uploads.current.clear();
    return list;
  };

  const track = useCallback((url: string) => {
    if (pageImageUuid(url)) uploads.current.add(url);
  }, []);

  const commit = useCallback(
    (blocks: PageBlock[]) => {
      const saved = JSON.stringify(blocks);
      discard(take().filter(url => !saved.includes(pageImageUuid(url) ?? url)));
    },
    [discard]
  );

  const cancel = useCallback(() => discard(take()), [discard]);

  // Editor left without closing the drawer (route change) → same as cancel.
  useEffect(() => cancel, [cancel]);

  // Tab closed / reloaded / navigated away → discard with a request that outlives the page.
  useEffect(() => {
    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      discard(take(), { keepalive: true });
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [discard]);

  // Heartbeat: keep the unsaved uploads of an open editor alive on the server.
  useEffect(() => {
    const beat = async () => {
      if (!uploads.current.size || document.visibilityState !== 'visible') return;
      const missing = await keep([...uploads.current]);
      if (!missing.length) return;
      missing.forEach(url => uploads.current.delete(url));
      toast.error(t('blocks.imageGone', { count: missing.length }), { duration: 10000 });
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') void beat();
    };
    const timer = window.setInterval(() => void beat(), KEEP_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [keep, t]);

  return useMemo(() => ({ track, commit, cancel }), [track, commit, cancel]);
};

export const PageImageSessionProvider: React.FC<{
  session: IPageImageSession;
  children: React.ReactNode;
}> = ({ session, children }) => (
  <PageImageSessionContext.Provider value={session}>{children}</PageImageSessionContext.Provider>
);

/** Session of the surrounding editor (null outside → uploads only cleaned by the cron). */
export const usePageImageTracker = () => useContext(PageImageSessionContext);
