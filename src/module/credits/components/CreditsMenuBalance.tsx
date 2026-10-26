import React from 'react';

import { useCreditsStore } from '../store.ts';
import { CreditsAmount } from './CreditsAmount.tsx';

/** Balance next to the "Credits" menu entry. */
export const CreditsMenuBalance: React.FC = () => {
  const balance = useCreditsStore(state => state.wallet?.balance);
  if (balance === undefined) return null;
  return (
    <CreditsAmount
      value={balance}
      className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-caption font-bold text-foreground"
    />
  );
};
