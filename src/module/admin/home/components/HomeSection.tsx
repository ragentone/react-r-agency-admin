import { Link } from '@tanstack/react-router';
import { cn } from '@ui/lib/utils';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { AdminPanel } from '../../ui/AdminPanel';

/**
 * Block of the admin home: a panel with title, optional "show all" link and the content below.
 * `bare` = no panel chrome (the content brings its own cards, e.g. the key figures).
 */
export const HomeSection: React.FC<{
  title: string;
  /** Small text next to the title (count badge, range …). */
  aside?: React.ReactNode;
  to?: string;
  linkLabel?: string;
  onNavigate?: () => void;
  bare?: boolean;
  /** Body without padding (lists and tables). */
  flush?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ title, aside, to, linkLabel, onNavigate, bare, flush, className, children }) => {
  const link =
    to && linkLabel ? (
      <Link
        to={to}
        onClick={onNavigate}
        className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-lg px-2.5 text-caption font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {linkLabel}
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    ) : undefined;

  if (bare) {
    return (
      <section className={cn('flex flex-col gap-3', className)} aria-label={title}>
        <header className="flex min-h-8 items-center gap-2 px-1">
          <h2 className="truncate text-title font-bold tracking-tight text-foreground">{title}</h2>
          {aside}
          <span className="ml-auto">{link}</span>
        </header>
        {children}
      </section>
    );
  }

  return (
    <AdminPanel title={title} aside={aside} action={link} flush={flush} className={className}>
      {children}
    </AdminPanel>
  );
};

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
