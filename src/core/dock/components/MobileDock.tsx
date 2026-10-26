import { cn } from '@ui/lib';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { useDock } from '../hooks';
import type { DockAlign, IDockEntry } from '../types.ts';
import { DockButton } from './DockButton.tsx';

/** Order of the groups in the (centered) row. */
const GROUPS: DockAlign[] = ['left', 'center', 'right'];

const renderEntry = (entry: IDockEntry) =>
  'component' in entry ? (
    <entry.component key={entry.id} />
  ) : (
    <DockButton key={entry.id} entry={entry} />
  );

/**
 * Full-width bar below the content – thumb reachable, always visible, never covers the page.
 * Buttons are registered dynamically (`Core.dock.register` / `useDockButton`) and shown
 * centered in one row on every screen size; `align` (left / center / right) only sets their
 * order. Too many buttons → the row scrolls sideways. While the app loads (`loading`) a
 * skeleton row is shown. Nothing registered → not rendered.
 */
/** Placeholder buttons while the app loads (same size as the real ones). */
const SKELETON_BUTTONS = 5;

interface IMobileDockProps {
  className?: string;
  /** App still loading (mesh connection / auth) → skeleton instead of the buttons. */
  loading?: boolean;
}

const MobileDock = ({ className, loading = false }: IMobileDockProps) => {
  const { t } = useTranslation('menu');
  const { entries, hidden } = useDock();
  const reduceMotion = useReducedMotion();

  if (!loading && (hidden || entries.length === 0)) return null;

  return (
    <motion.nav
      aria-label={t('dock')}
      aria-busy={loading || undefined}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
      className={cn(
        // Part of the layout column: the page area shrinks by the dock height.
        'relative z-40 shrink-0',
        className
      )}
    >
      {/* All buttons centered in one row – order: left → center → right group. */}
      <div
        className={
          'flex min-h-14 items-center justify-center-safe gap-1.5 overflow-x-auto border-t border-border/50 bg-background/85 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur-xl [scrollbar-width:none] dark:bg-black/80'
        }
      >
        {loading
          ? Array.from({ length: SKELETON_BUTTONS }, (_, i) => (
              <Skeleton key={i} aria-hidden={'true'} className={'size-11 shrink-0 rounded-full'} />
            ))
          : GROUPS.flatMap(group =>
              entries.filter(entry => (entry.align ?? 'center') === group).map(renderEntry)
            )}
      </div>
    </motion.nav>
  );
};

export { MobileDock };
