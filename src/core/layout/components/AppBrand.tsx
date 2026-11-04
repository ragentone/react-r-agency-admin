import { CoreVariables } from '@core/core.variables.ts';
import { cn } from '@ui/lib';
import { motion, useReducedMotion } from 'framer-motion';

import { HeaderLogo } from './HeaderLogo.tsx';

interface IAppBrandProps {
  /** Wrapper (layout, padding). Default: row with logo and text. */
  className?: string;
  /** Title + subtitle block (e.g. `hidden xl:flex` to show the text only on wide screens). */
  textClassName?: string;
}

/** App brand: logo, title and subtitle from `CoreVariables`. Used in the sidebar and the mobile menu. */
const AppBrand = ({ className, textClassName }: IAppBrandProps) => {
  const title = CoreVariables.headerTitle;
  const subtitle = CoreVariables.headerSubTitle;
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('group flex items-center gap-3.5', className)}>
      {/* Intro: the logo turns a few times when the brand appears (off with reduced motion). */}
      <motion.div
        className={'relative shrink-0'}
        initial={reduceMotion ? false : { rotate: 0 }}
        animate={{ rotate: 360 * 3 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <HeaderLogo
          alt={title ?? 'Logo'}
          className={
            'size-12 cursor-pointer select-none rounded-full bg-black object-contain shadow-md ring-2 ring-foreground/10 transition-transform duration-300 group-hover:scale-105 group-hover:ring-foreground/25 active:scale-95'
          }
        />
      </motion.div>
      <div className={cn('flex min-w-0 flex-col gap-0.5', textClassName)}>
        {title && (
          <span className={'truncate text-title font-extrabold tracking-tight text-foreground'}>{title}</span>
        )}
        {subtitle && (
          <span className={'truncate text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground'}>
            {subtitle}
          </span>
        )}
        {title && <span className={'mt-1 h-0.5 w-8 rounded-full bg-foreground transition-all duration-300 group-hover:w-14'} />}
      </div>
    </div>
  );
};

export { AppBrand };
