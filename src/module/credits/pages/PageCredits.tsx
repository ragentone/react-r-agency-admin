import { RoutePage } from '@router/components';
import React from 'react';

import { CreditsWalletView } from '../components/CreditsWalletView.tsx';

/** `/credits`: wallet of the signed-in user. */
export const PageCredits: React.FC = () => (
  <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
    <CreditsWalletView />
  </RoutePage>
);
