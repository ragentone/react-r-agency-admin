import { create } from 'zustand';

import { CookieApi } from './api';

export type CookieConsentStatus = 'accepted' | 'rejected' | 'pending';

const STORAGE_KEY = 'cookie_consent_status';

interface CookieStoreState {
  status: CookieConsentStatus;
  isOpen: boolean;
  isLoading: boolean;
  open: () => void;
  close: () => void;
  accept: () => Promise<void>;
  reject: () => Promise<void>;
  init: () => void;
}

const getStoredConsent = (): CookieConsentStatus => {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'accepted' || val === 'rejected') {
      return val;
    }
  } catch {
    // localStorage might be unavailable or restricted
  }
  return 'pending';
};

export const useCookieStore = create<CookieStoreState>(set => ({
  status: 'pending',
  isOpen: false,
  isLoading: false,

  init: () => {
    const currentStatus = getStoredConsent();
    set({
      status: currentStatus,
      isOpen: currentStatus === 'pending',
    });
  },

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  accept: async () => {
    set({ isLoading: true });
    try {
      await CookieApi.accept();
      try {
        localStorage.setItem(STORAGE_KEY, 'accepted');
      } catch {
        // ignore
      }
      set({ status: 'accepted', isOpen: false, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  reject: async () => {
    set({ isLoading: true });
    try {
      await CookieApi.reject();
      try {
        localStorage.setItem(STORAGE_KEY, 'rejected');
      } catch {
        // ignore
      }
      set({ status: 'rejected', isOpen: false, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));

export const useCookieConsent = () => {
  const status = useCookieStore(s => s.status);
  const isOpen = useCookieStore(s => s.isOpen);
  const isLoading = useCookieStore(s => s.isLoading);
  const open = useCookieStore(s => s.open);
  const close = useCookieStore(s => s.close);
  const accept = useCookieStore(s => s.accept);
  const reject = useCookieStore(s => s.reject);

  return {
    status,
    isOpen,
    isLoading,
    open,
    close,
    accept,
    reject,
  };
};
