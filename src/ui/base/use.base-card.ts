import { useContext } from 'react';

import { BaseCardContext } from './base-card.context.ts';

export const useBaseCard = () => {
  const context = useContext(BaseCardContext);
  if (!context) {
    throw new Error('useBaseCard must be used within a BaseCardProvider');
  }
  return context;
};
