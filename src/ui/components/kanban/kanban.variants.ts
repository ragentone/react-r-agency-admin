import { cva } from 'class-variance-authority';

/** Fixed width and height: the row scrolls sideways, each column scrolls its cards up and down. */
export const kanbanColumnVariants = cva(
  'flex h-[calc(100dvh-14rem)] w-72 shrink-0 snap-start flex-col gap-2 rounded-lg bg-muted/60 p-2'
);

export const kanbanCardClassName =
  'flex items-start gap-2 rounded-md border border-border/50 bg-background p-3 shadow-sm transition-shadow hover:shadow-md';

export const kanbanMoreTriggerClassName =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:size-9';
