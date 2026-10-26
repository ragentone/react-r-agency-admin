import { cn } from '@ui/lib/utils';

/** Shared class names of the credits screens (focus, touch feedback, inputs). */

/** Keyboard focus ring (never shown for touch / mouse). */
export const creditsFocus =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Full-width rows / list buttons: hover on pointer devices, press tint on touch. */
export const creditsRowInteractive =
  'outline-none transition-colors hover:bg-foreground/[0.03] active:bg-foreground/[0.06] focus-visible:bg-foreground/[0.05]';

/** Round icon button with a 40px hit area. */
export const creditsIconButton = cn(
  'grid size-10 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-foreground/[0.06] active:bg-foreground/[0.1] disabled:opacity-40',
  creditsFocus
);

/** Text inputs: pill on one line, focus = black / white border. */
export const creditsInput =
  'h-11 w-full min-w-0 rounded-2xl border border-border bg-transparent px-4 text-body text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground disabled:opacity-50 aria-[invalid=true]:border-destructive';

export const creditsLabel = 'text-caption font-semibold text-muted-foreground';
