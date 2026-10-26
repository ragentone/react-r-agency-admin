/**
 * Auth UI styles — Twitter/X look, strictly black & white.
 *
 * Uses only `foreground` / `background` / neutral tokens, so light mode is
 * black-on-white and dark mode flips to white-on-black automatically.
 * Mobile first: 48–56px touch targets, 17px input text (no iOS zoom).
 */

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Base for every pill button. */
const pill =
  'inline-flex w-full items-center justify-center gap-2 rounded-full border text-body font-bold shadow-none transition-[background-color,opacity,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 ' +
  focusRing;

/** Filled black pill (white in dark mode) — primary action. */
export const authButtonPrimary = `${pill} h-12 border-transparent bg-foreground text-background hover:bg-foreground/85 active:bg-foreground/75`;

/** Outlined pill — secondary action. */
export const authButtonSecondary = `${pill} h-12 border-border bg-background text-foreground hover:bg-foreground/[0.06] active:bg-foreground/10 dark:border-foreground/30 dark:bg-transparent`;

/** Text-only pill — tertiary action (e.g. "back"). */
export const authButtonGhost = `${pill} h-12 border-transparent bg-transparent text-foreground hover:bg-foreground/[0.06] active:bg-foreground/10`;

/** Smaller pill variant (popovers, inline). Combine with one of the above. */
export const authButtonSmall = 'h-10 text-sm';

/**
 * Text input: 56px tall, 4px radius, thin grey border that turns into a
 * 2px black (white in dark) border on focus — like X.
 */
export const authInput =
  'h-10 w-full border border-border bg-background px-3 text-[17px] text-foreground shadow-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground md:text-[17px] dark:border-foreground/30 dark:bg-transparent ' +
  'outline-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-0 ' +
  'aria-invalid:border-foreground aria-invalid:text-foreground aria-invalid:ring-1 aria-invalid:ring-foreground dark:aria-invalid:border-foreground dark:aria-invalid:text-foreground dark:aria-invalid:ring-foreground ' +
  'disabled:cursor-not-allowed disabled:opacity-50 rounded-full';

/** Padding when a leading icon is shown. */
export const authInputWithIcon = 'pl-11';
/** Padding when a trailing action (password toggle) is shown. */
export const authInputWithAction = 'pr-12';

/** Leading icon inside an input. */
export const authInputIcon =
  'pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-muted-foreground transition-colors peer-focus-visible:text-foreground';

/** Round icon button inside an input (show/hide password). */
export const authInputAction =
  'absolute top-1/2 right-2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground ' +
  focusRing;
