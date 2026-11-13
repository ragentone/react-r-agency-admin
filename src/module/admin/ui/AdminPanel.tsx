import { cn } from '@ui/lib/utils';
import React from 'react';

interface IAdminPanelProps {
  title?: string;
  description?: string;
  /** Small element next to the title (count, badge). */
  aside?: React.ReactNode;
  /** Right edge of the header (link, button, tabs). */
  action?: React.ReactNode;
  /** No padding in the body – lists and tables run edge to edge. */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** White surface with a thin border and an optional header row – the base of every admin block. */
export const AdminPanel: React.FC<IAdminPanelProps> = ({
  title,
  description,
  aside,
  action,
  flush,
  className,
  children,
}) => (
  <section
    aria-label={title}
    className={cn('overflow-hidden rounded-xl border border-border/50 bg-card', className)}
  >
    {title && (
      <header className="flex min-h-14 items-center gap-2 border-b border-border/50 px-4 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-title font-bold tracking-tight">{title}</h2>
            {aside}
          </div>
          {description && (
            <p className="truncate text-caption text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </header>
    )}
    <div className={cn(!flush && 'p-4')}>{children}</div>
  </section>
);
