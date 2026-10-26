import { useContext } from 'react';

import { PwaContext } from './pwa.context.ts';

/** PWA state + actions (install, update, online …). */
export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) throw new Error('usePwa must be used within PwaProvider');
  return context;
};
