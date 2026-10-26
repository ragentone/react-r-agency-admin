import { cn } from '@ui/lib/utils';
import { Loader2, type LucideIcon } from 'lucide-react';
import React, { type ReactNode } from 'react';

import { creditsFocus, creditsRowInteractive } from './credits.classes.ts';

/**
 * Shared building blocks of the credits screens (X-style, black / white, mobile first):
 * one place for focus rings, touch feedback and spacing so every view behaves the same.
 */

// ---- page header ---------------------------------------------------------------------------

/** Sticky, translucent header with title, subtitle and optional tabs (X-style). */
export const CreditsPageHeader: React.FC<{
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}> = ({ title, subtitle, children }) => (
  <header className="sticky top-0 z-20 border-b border-border/50 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
    <div className={cn('px-4 pt-3', children ? 'pb-1' : 'pb-3')}>
      <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && <p className="truncate text-caption text-muted-foreground">{subtitle}</p>}
    </div>
    {children}
  </header>
);

// ---- tabs ----------------------------------------------------------------------------------

/**
 * Tabs like the X timeline: equal width, bold active label, indicator as wide as the label.
 * Arrow keys move between tabs (WAI-ARIA tabs pattern).
 */
export const CreditsTabs = <T extends string>({
  tabs,
  value,
  onChange,
  labelOf,
  label,
  idPrefix,
  panelId,
}: {
  tabs: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labelOf: (value: T) => string;
  label: string;
  idPrefix: string;
  panelId: string;
}) => {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.indexOf(value);
    const next =
      event.key === 'ArrowRight'
        ? tabs[(index + 1) % tabs.length]
        : event.key === 'ArrowLeft'
          ? tabs[(index - 1 + tabs.length) % tabs.length]
          : event.key === 'Home'
            ? tabs[0]
            : event.key === 'End'
              ? tabs[tabs.length - 1]
              : undefined;
    if (!next) return;
    event.preventDefault();
    onChange(next);
    document.getElementById(`${idPrefix}-${next}`)?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className="flex" onKeyDown={onKeyDown}>
      {tabs.map(item => {
        const active = item === value;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            id={`${idPrefix}-${item}`}
            aria-selected={active}
            aria-controls={panelId}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item)}
            className={cn(
              'flex h-13 min-w-0 flex-1 items-stretch justify-center px-2 text-body',
              creditsRowInteractive,
              active ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'
            )}
          >
            <span className="relative flex min-w-0 items-center">
              <span className="truncate">{labelOf(item)}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 bottom-0 h-1 rounded-full bg-foreground transition-opacity',
                  active ? 'opacity-100' : 'opacity-0'
                )}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ---- chips ---------------------------------------------------------------------------------

/** Toggle chips (filters, ranges) – scroll sideways instead of wrapping on small screens. */
export const CreditsChips = <T extends string | number>({
  options,
  value,
  onChange,
  labelOf,
  label,
  className,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labelOf: (value: T) => string;
  label: string;
  className?: string;
}) => (
  <div
    role="group"
    aria-label={label}
    className={cn('scrollbar-hide flex gap-2 overflow-x-auto px-4', className)}
  >
    {options.map(item => {
      const active = item === value;
      return (
        <button
          key={String(item)}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(item)}
          className={cn(
            'h-9 shrink-0 rounded-full border px-4 text-caption font-bold whitespace-nowrap transition-colors',
            creditsFocus,
            active
              ? 'border-foreground bg-foreground text-background'
              : 'border-border text-foreground hover:bg-foreground/4 active:bg-foreground/8'
          )}
        >
          {labelOf(item)}
        </button>
      );
    })}
  </div>
);

// ---- states --------------------------------------------------------------------------------

export const CreditsErrorState: React.FC<{
  text: ReactNode;
  retryLabel: string;
  onRetry: () => void;
  className?: string;
}> = ({ text, retryLabel, onRetry, className }) => (
  <div role="alert" className={cn('mx-auto max-w-sm px-8 py-12 text-center', className)}>
    <p className="text-body text-muted-foreground">{text}</p>
    <button
      type="button"
      onClick={onRetry}
      className={cn(
        'mt-4 h-10 rounded-full bg-foreground px-5 text-body font-bold text-background transition-opacity hover:opacity-85 active:opacity-75',
        creditsFocus
      )}
    >
      {retryLabel}
    </button>
  </div>
);

export const CreditsEmptyState: React.FC<{
  icon: LucideIcon;
  title?: ReactNode;
  text?: ReactNode;
  className?: string;
}> = ({ icon: Icon, title, text, className }) => (
  <div
    className={cn('mx-auto flex max-w-sm flex-col items-center px-8 py-14 text-center', className)}
  >
    <span className="grid size-14 place-items-center rounded-full bg-foreground/[0.06]">
      <Icon className="size-6" strokeWidth={1.8} aria-hidden="true" />
    </span>
    {title && <h2 className="mt-4 text-title font-bold text-foreground">{title}</h2>}
    {text && (
      <p className={cn('text-body text-muted-foreground', title ? 'mt-1' : 'mt-4')}>{text}</p>
    )}
  </div>
);

export const CreditsLoadMore: React.FC<{
  label: string;
  onClick: () => void;
  loading?: boolean;
}> = ({ label, onClick, loading = false }) => (
  <div className="px-4 py-4">
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={cn(
        'inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-body font-bold transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08] disabled:opacity-50',
        creditsFocus
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {label}
    </button>
  </div>
);

// ---- stats ---------------------------------------------------------------------------------

export interface ICreditsStat {
  key: string;
  label: ReactNode;
  value: ReactNode;
  /** Optional color dot in front of the label (charts). */
  swatch?: string;
}

/** Small stat tiles – labels never push the grid wider than the screen. */
export const CreditsStats: React.FC<{
  items: ICreditsStat[];
  className?: string;
  tileClassName?: string;
}> = ({ items, className, tileClassName }) => (
  <dl className={cn('grid grid-cols-3 gap-2', className)}>
    {items.map(item => (
      <div
        key={item.key}
        className={cn('min-w-0 rounded-2xl bg-foreground/4 px-3 py-2.5', tileClassName)}
      >
        <dt className="flex min-w-0 items-center gap-1.5 text-micro font-semibold text-muted-foreground uppercase">
          {item.swatch && (
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: item.swatch }}
            />
          )}
          <span className="truncate">{item.label}</span>
        </dt>
        <dd className="mt-0.5 truncate text-body font-bold text-foreground tabular-nums">
          {item.value}
        </dd>
      </div>
    ))}
  </dl>
);
