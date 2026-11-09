import { cn } from '@ui/lib';

/** Blinking red dot (static with reduced motion), e.g. "new app version available". */
export const MenuAttentionDot = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn('pointer-events-none absolute flex size-2.5', className)}>
    <span
      className={
        'absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75 motion-reduce:animate-none'
      }
    />
    <span
      className={'relative inline-flex size-2.5 rounded-full bg-destructive ring-2 ring-background'}
    />
  </span>
);
