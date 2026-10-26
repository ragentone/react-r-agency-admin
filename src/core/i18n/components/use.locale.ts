import { useContext } from 'react';

import { LocaleContext } from './locale.context.ts';

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
