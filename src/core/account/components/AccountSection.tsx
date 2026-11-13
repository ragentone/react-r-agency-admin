import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns/drawer';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import React, { useState } from 'react';

export interface AccountSectionProps {
  /** Stable id of the section (used for the row's DOM id). */
  value?: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Red title/icon, for irreversible actions (delete). */
  destructive?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * X-style settings row (icon | title + description | chevron). Min. 60px high
 * (comfortable touch target on phones) – tapping it opens the content in an `AppDrawer`.
 */
export const AccountSection: React.FC<AccountSectionProps> = ({
  value,
  icon: Icon,
  title,
  description,
  destructive = false,
  className,
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        id={value ? `account-section-${value}` : undefined}
        onClick={() => setOpen(true)}
        className={cn(
          'group flex min-h-15 w-full items-center gap-4 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05] focus-visible:outline-none active:bg-foreground/[0.06]',
          className
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            'size-5 shrink-0',
            destructive ? 'text-destructive' : 'text-muted-foreground'
          )}
          strokeWidth={1.75}
        />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-body leading-5',
              destructive ? 'text-destructive' : 'text-foreground'
            )}
          >
            {title}
          </span>
          {description && (
            <span className="mt-0.5 block truncate text-caption leading-4 text-muted-foreground">
              {description}
            </span>
          )}
        </span>
        <ChevronRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </button>

      <AppDrawer
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        autoHeight={true}
      >
        {children}
      </AppDrawer>
    </>
  );
};
