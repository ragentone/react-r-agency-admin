import { cn } from '@ui/lib/utils';
import React from 'react';

/** `classes.scroll` of `RoutePage`: tinted canvas, the panels on it are the white surfaces. */
export const ADMIN_SCROLL = 'p-0 bg-muted/30 dark:bg-muted/10';

/** Page widths – mobile first, the canvas only grows on large screens. */
export const ADMIN_WIDTH = { wide: 1200, base: 1040, narrow: 820 } as const;

/** Canvas of an admin page: tight on phones, roomier from `md`, panels stacked with one gap. */
export const AdminPage: React.FC<{
  className?: string;
  children: React.ReactNode;
  slot?: string;
}> = ({ className, children, slot = 'admin-page' }) => (
  <div
    data-slot={slot}
    className={cn(
      'mx-auto flex min-h-full w-full flex-col gap-4 p-3 pb-10 sm:p-4 md:gap-6 md:p-6',
      className
    )}
  >
    {children}
  </div>
);

/** Heading row inside the canvas: title + description left, actions right. */
export const AdminHeading: React.FC<{
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description, actions }) => (
  <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div className="min-w-0">
      <h1 className="truncate text-display font-bold text-foreground">{title}</h1>
      {description && <p className="text-body text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2 md:w-80">{actions}</div>}
  </header>
);
