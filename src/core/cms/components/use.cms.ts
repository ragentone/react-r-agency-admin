import { useContext } from 'react';

import { CmsContext } from './cms.context.ts';

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
