import { useApp } from '@core/app';
import { parseCssWidthOrHeight } from '@core/utils';
import { cn } from '@ui/lib';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface IProps {
  className?: string;
  height?: string | number;
  smooth?: boolean;
  /** Custom scroll-to-top (e.g. inside a dialog); default scrolls the page content. */
  onScrollTop?: () => void;
}

/**
 * End-of-page block with a "Back to top" button. The button only appears (animated)
 * while the block itself is in view, and hides again when it scrolls out.
 */
const PageScrollTopBlock = ({ className, height, smooth = true, onScrollTop }: IProps) => {
  const { t } = useTranslation('layout');
  const reduceMotion = useReducedMotion();
  const {
    layout: {
      content: { scrollTop },
    },
  } = useApp();

  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Visible = a good part of the block is on screen (not just its top edge).
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-slot="page-scroll-top"
      style={{ height: parseCssWidthOrHeight(height, '200px') }}
      className={cn('relative flex w-full items-center justify-center', className)}
    >
      <AnimatePresence>
        {visible && (
          <motion.button
            key="scroll-top"
            type="button"
            onClick={() => (onScrollTop ? onScrollTop() : scrollTop(smooth))}
            aria-label={t('scrollTop.label')}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            whileTap={reduceMotion ? undefined : { scale: 0.94 }}
            className="group flex flex-col items-center gap-2 rounded-2xl px-6 py-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-12 place-items-center rounded-full border border-border/50 bg-background shadow-sm transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
              <ArrowUp
                className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5"
                strokeWidth={2.25}
              />
            </span>
            <span className="text-caption font-bold">{t('scrollTop.label')}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export { PageScrollTopBlock };
