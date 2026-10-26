import { cn } from '@ui/lib';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/shad-cn/components/avatar.tsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface IProps {
  /** `true` while the logout request runs. */
  active: boolean;
  name?: string;
  avatarUrl?: string | null;
  /** Logout succeeded (user no longer authorized) → "See you soon", otherwise just fade out. */
  signedOut: boolean;
}

/** Overlay stays at least this long – a fast logout should not just flicker. */
const MIN_VISIBLE_MS = 900;
/** "See you soon" is shown this long after the request finished. */
const GOODBYE_MS = 650;

type Phase = 'hidden' | 'leaving' | 'goodbye';

/**
 * Matte full screen overlay during logout: frosted backdrop, avatar with spinning ring,
 * then a short "See you soon" before it fades out.
 */
const AuthLogoutOverlay = ({ active, name, avatarUrl, signedOut }: IProps) => {
  const { t } = useTranslation('auth');
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('hidden');
  const [snapshot, setSnapshot] = useState<{ name?: string; avatarUrl?: string | null }>({});
  const shownAt = useRef(0);

  // Logout starts → show + remember who is leaving (userMeta is cleared afterwards).
  if (active && phase === 'hidden') {
    setPhase('leaving');
    setSnapshot({ name, avatarUrl });
  }

  useEffect(() => {
    if (phase === 'leaving' && shownAt.current === 0) shownAt.current = Date.now();
    if (active || phase !== 'leaving') return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt.current));
    const next = window.setTimeout(() => {
      if (signedOut) {
        setPhase('goodbye');
      } else {
        shownAt.current = 0;
        setPhase('hidden');
      }
    }, wait);
    return () => window.clearTimeout(next);
  }, [active, phase, signedOut]);

  useEffect(() => {
    if (phase !== 'goodbye') return;
    const hide = window.setTimeout(() => {
      shownAt.current = 0;
      setPhase('hidden');
    }, GOODBYE_MS);
    return () => window.clearTimeout(hide);
  }, [phase]);

  const displayName = snapshot.name ?? '';

  return createPortal(
    <AnimatePresence>
      {phase !== 'hidden' && (
        <motion.div
          key={'logout-overlay'}
          role={'status'}
          aria-live={'polite'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          className={
            'fixed inset-0 z-[200] grid place-items-center bg-background/70 backdrop-blur-2xl backdrop-saturate-50 supports-[not(backdrop-filter:blur(0))]:bg-background/95'
          }
          // Block every interaction while leaving.
          onPointerDown={e => e.preventDefault()}
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={'flex flex-col items-center gap-5 px-6 text-center'}
          >
            <div className={'relative grid size-24 place-items-center'}>
              {/* Spinning ring while the request runs, solid ring when done. */}
              <motion.span
                aria-hidden
                className={cn(
                  'absolute inset-0 rounded-full',
                  phase === 'leaving'
                    ? 'bg-[conic-gradient(from_0deg,var(--color-foreground),transparent_70%)]'
                    : 'bg-foreground'
                )}
                animate={phase === 'leaving' && !reduceMotion ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  phase === 'leaving'
                    ? { duration: 1, repeat: Infinity, ease: 'linear' }
                    : { duration: 0.2 }
                }
              />
              <span aria-hidden className={'absolute inset-[3px] rounded-full bg-background'} />
              <Avatar className={'relative size-[84px]'}>
                {snapshot.avatarUrl && <AvatarImage src={snapshot.avatarUrl} alt={displayName} />}
                <AvatarFallback
                  className={'bg-foreground text-display font-extrabold uppercase text-background'}
                >
                  {displayName.slice(0, 1) || '·'}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {phase === 'goodbye' && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className={
                      'absolute -right-0.5 -bottom-0.5 grid size-8 place-items-center rounded-full bg-foreground text-background ring-4 ring-background'
                    }
                  >
                    <Check className={'size-4'} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode={'wait'} initial={false}>
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className={'flex flex-col gap-1'}
              >
                <p className={'text-title font-bold tracking-tight text-foreground'}>
                  {phase === 'leaving'
                    ? t('logout.loggingOut')
                    : displayName
                      ? t('logout.goodbyeName', { name: displayName })
                      : t('logout.goodbye')}
                </p>
                <p className={'text-caption text-muted-foreground'}>
                  {phase === 'leaving' ? t('logout.overlayHint') : t('logout.goodbyeHint')}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export { AuthLogoutOverlay };
