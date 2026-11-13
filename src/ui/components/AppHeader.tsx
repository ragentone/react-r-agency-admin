import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { ArrowLeft } from 'lucide-react';
import type * as React from 'react';

export interface AppHeaderProps extends Omit<React.ComponentProps<'header'>, 'title'> {
  title: React.ReactNode;
  /** `p` when the page content has its own `h1`. */
  titleAs?: 'h1' | 'p';
  subtitle?: React.ReactNode;
  /** Shows a back arrow on the left. Needs `backLabel` (translated). */
  onBack?: () => void;
  backLabel?: string;
  /** Left slot instead of the back arrow (avatar, menu button …). */
  leading?: React.ReactNode;
  /** Right slot – at most two icon buttons, more go into a `⋯` menu. */
  actions?: React.ReactNode;
  /** Tap on the title, e.g. scroll to top (like X). */
  onTitleClick?: () => void;
  /** Keep clear of the notch / status bar. Off inside drawers and dialogs. */
  safeArea?: boolean;
  /** Slides the bar out of view (phones only), e.g. while scrolling down. */
  hidden?: boolean;
}

/**
 * X-style top bar of a page: sticky, blurred, 56px. Back arrow or `leading`, title with an
 * optional subtitle, actions on the right. Place it as the first child of the scroll container.
 */
export function AppHeader({
  title,
  titleAs: Title = 'h1',
  subtitle,
  onBack,
  backLabel,
  leading,
  actions,
  onTitleClick,
  safeArea = true,
  hidden = false,
  className,
  ...props
}: AppHeaderProps) {
  const hasLeading = Boolean(onBack || leading);

  return (
    <header
      data-slot="app-header"
      data-hidden={hidden || undefined}
      {...props}
      className={cn(
        'sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur',
        // Hide on scroll: phones only, back at once on keyboard focus.
        'transition-transform duration-200 has-[:focus-visible]:translate-y-0! motion-reduce:transition-none',
        'data-hidden:-translate-y-full md:data-hidden:translate-y-0',
        safeArea && 'pt-[env(safe-area-inset-top)]',
        className
      )}
    >
      <div className={cn('flex h-14 items-center gap-3 px-2', !hasLeading && 'pl-4')}>
        {onBack ? (
          <Button variant="ghost" size="icon-lg" onClick={onBack} aria-label={backLabel}>
            <ArrowLeft className="size-5" />
          </Button>
        ) : (
          leading && <div className="flex shrink-0 items-center">{leading}</div>
        )}
        <div
          data-slot="app-header-title"
          className={cn(
            'min-w-0 flex-1 transition-opacity duration-200',
            onTitleClick && 'cursor-pointer select-none'
          )}
          onClick={onTitleClick}
        >
          <Title className="truncate text-title font-bold text-foreground">{title}</Title>
          {subtitle && <p className="truncate text-caption text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
    </header>
  );
}
