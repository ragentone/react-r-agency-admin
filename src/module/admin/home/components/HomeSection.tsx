import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { ChevronRight } from 'lucide-react';
import React from 'react';

/** Block of the admin home: bold title (X style), optional "show all" link, content below. */
export const HomeSection: React.FC<{
  title: string;
  /** Small text next to the title (count badge, range …). */
  aside?: React.ReactNode;
  to?: string;
  linkLabel?: string;
  onNavigate?: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ title, aside, to, linkLabel, onNavigate, className, children }) => (
  <section className={cn('flex flex-col gap-3 px-4 py-4', className)} aria-label={title}>
    <header className="flex min-h-8 items-center gap-2">
      <h2 className="truncate text-title font-bold tracking-tight text-foreground">{title}</h2>
      {aside}
      {to && linkLabel && (
        <Link
          to={to}
          onClick={onNavigate}
          className="ml-auto inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full px-3 text-caption font-bold text-foreground transition-colors hover:bg-foreground/[0.06] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {linkLabel}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </header>
    {children}
  </section>
);

/** Small inline error with retry (one block failed, the rest of the page stays usable). */
export const HomeError: React.FC<{ text: string; retry: string; onRetry: () => void }> = ({
  text,
  retry,
  onRetry,
}) => (
  <p role="alert" className="flex items-center gap-2 text-caption text-muted-foreground">
    {text}
    <button
      type="button"
      onClick={onRetry}
      className="font-bold text-foreground underline-offset-4 hover:underline"
    >
      {retry}
    </button>
  </p>
);
