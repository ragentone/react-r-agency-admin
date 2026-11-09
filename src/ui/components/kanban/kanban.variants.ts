import { cva } from 'class-variance-authority';

/** Mobile: only the active column is shown (tab bar). md+: all columns side by side. */
export const kanbanColumnVariants = cva('min-w-0 flex-col gap-2 rounded-lg bg-muted/60 p-2', {
  variants: {
    active: {
      true: 'flex',
      false: 'hidden md:flex',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const kanbanCardClassName =
  'flex items-start gap-2 rounded-md border border-border/50 bg-background p-3 shadow-sm transition-shadow hover:shadow-md';

export const kanbanMoreTriggerClassName =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:size-9';
