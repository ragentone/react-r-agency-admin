import { useContext } from 'react';

import { ExtensionContext } from './extension.context.ts';

export const useExtension = () => {
  const context = useContext(ExtensionContext);
  if (!context) {
    throw new Error('useExtensionProvider must be used within a ExtensionProvider');
  }
  return context;
};
