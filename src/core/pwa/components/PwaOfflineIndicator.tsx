import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { usePwa } from './use.pwa.ts';

/** Small pill at the top while the device is offline. */
export const PwaOfflineIndicator = () => {
  const { t } = useTranslation('pwa');
  const { online } = usePwa();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[90] flex justify-center px-4"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-caption font-semibold text-background shadow-lg">
            <WifiOff className="size-4" />
            {t('offline')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
