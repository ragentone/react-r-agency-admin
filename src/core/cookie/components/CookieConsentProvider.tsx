import React, { useEffect } from 'react';

import { useCookieStore } from '../store.ts';
import { CookieConsentDrawer } from './CookieConsentDrawer.tsx';

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    useCookieStore.getState().init();
  }, []);

  return (
    <>
      {children}
      <CookieConsentDrawer />
    </>
  );
};
