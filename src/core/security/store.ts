import { create } from 'zustand/react';

/** Things to show right after a sign-in (the flow navigates away, so they live here). */
export interface ISecurityStore {
  deletionPending: string | null;
  offerPasskey: boolean;
  /** Account drawer to open (e.g. from a push / notification action). */
  drawer: SecurityDrawerName | null;
  setDeletionPending: (iso: string | null) => void;
  setOfferPasskey: (offer: boolean) => void;
  openDrawer: (drawer: SecurityDrawerName | null) => void;
}

export type SecurityDrawerName =
  'sessions' | 'passkeys' | 'totp' | 'email' | 'password' | 'invite' | 'delete';

const DRAWERS: SecurityDrawerName[] = [
  'sessions',
  'passkeys',
  'totp',
  'email',
  'password',
  'invite',
  'delete',
];

/** `?drawer=sessions` (push "new sign-in") – read once at start, removed from the address bar. */
const drawerFromUrl = (): SecurityDrawerName | null => {
  try {
    const url = new URL(window.location.href);
    const value = url.searchParams.get('drawer') as SecurityDrawerName | null;
    if (!value || !DRAWERS.includes(value)) return null;
    url.searchParams.delete('drawer');
    window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    return value;
  } catch {
    return null;
  }
};

export const useSecurityStore = create<ISecurityStore>()(set => ({
  deletionPending: null,
  offerPasskey: false,
  drawer: drawerFromUrl(),
  setDeletionPending: deletionPending => set({ deletionPending }),
  setOfferPasskey: offerPasskey => set({ offerPasskey }),
  openDrawer: drawer => set({ drawer }),
}));

const DISMISS_KEY = 'auth-passkey-prompt-dismissed';

export const passkeyPromptDismissed = (): boolean => {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

export const dismissPasskeyPrompt = () => {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    // Private mode – asked again next time, fine.
  }
};
