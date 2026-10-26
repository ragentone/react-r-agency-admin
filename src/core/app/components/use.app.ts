import { useContext } from 'react';

import { ApplicationContext } from './application.context.ts';

export const useApp = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApp must be used within an ApplicationProvider');
  }
  return context;
};
