import { useContext } from 'react';

import { BaseAccordionContext } from './base-accordion.context.ts';

export const useBaseAccordion = () => {
  const context = useContext(BaseAccordionContext);
  if (!context) {
    throw new Error('useBaseAccordion must be used within a BaseAccordionProvider');
  }
  return context;
};
