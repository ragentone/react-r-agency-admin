import React, { useEffect } from 'react';

import { useCookieStore } from '../store.ts';

export const CookieLinkContent: React.FC<{ close: () => void }> = ({ close }) => {
  useEffect(() => {
    close();
    useCookieStore.getState().open();
  }, [close]);

  return null;
};
