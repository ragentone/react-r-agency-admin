import { FullscreenPage } from '@ui/base/FullscreenPage.tsx';
import { useReducedMotion } from 'framer-motion';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountView } from './AccountView';

export interface IAccountDialogProps {
  open: boolean;
  /** Back arrow, Escape – the caller restores the URL. */
  onClose: () => void;
}

/**
 * Account as full screen page (all sizes) – same frame as the profile:
 * 600px column, the page below stays mounted. The route (`/account`) stays.
 */
export const AccountDialog: React.FC<IAccountDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation('account');
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [reduceMotion]);

  return (
    <FullscreenPage
      open={open}
      onClose={onClose}
      title={t('title')}
      slot="account-dialog"
      contentRef={scrollRef}
      contentClassName="overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]"
    >
      <AccountView onBack={onClose} onScrollTop={scrollTop} />
    </FullscreenPage>
  );
};
