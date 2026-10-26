import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IProps {
  visible: boolean;
  onRetry: () => void;
}

/** Erst nach kurzer Verzögerung zeigen – schnelle Reconnects (z. B. nach Tab-Wechsel) flackern nicht. */
const SHOW_DELAY_MS = 1500;
/** Danach zusätzlich „Erneut versuchen“ anbieten. */
const RETRY_HINT_DELAY_MS = 10_000;

/**
 * Dezente Pill oben, während die Mesh-Verbindung nach einem Abbruch wiederhergestellt wird.
 * Die App bleibt dabei vollständig bedienbar (kein Vollbild-Fehler). Offline übernimmt der
 * PwaOfflineIndicator.
 */
export const MeshReconnectBanner = ({ visible, onRetry }: IProps) => {
  const { t } = useTranslation('mesh');
  const reduceMotion = useReducedMotion();
  const [show, setShow] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const showTimer = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    const retryTimer = setTimeout(() => setShowRetry(true), RETRY_HINT_DELAY_MS);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(retryTimer);
      setShow(false);
      setShowRetry(false);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && show && online && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[90] flex justify-center px-4"
        >
          <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-foreground py-2 pr-2 pl-4 text-caption font-semibold text-background shadow-lg">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            {t('banner.reconnecting')}
            {showRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="ml-1 inline-flex min-h-8 items-center gap-1 rounded-full bg-background/15 px-3 py-1 transition-colors hover:bg-background/25 focus-visible:ring-2 focus-visible:ring-background/60 focus-visible:outline-none"
              >
                <RefreshCw className="size-3.5" />
                {t('banner.retry')}
              </button>
            ) : (
              <span className="pr-2" />
            )}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
