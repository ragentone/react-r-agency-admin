import { cn } from '@ui/lib/utils';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@ui/shad-cn/components/accordion';
import type { LucideIcon } from 'lucide-react';
import React from 'react';

export interface AccountSectionProps {
  value: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Red title/icon, for irreversible actions (delete). */
  destructive?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * X-style settings row: flat, full width, plain icon, title + description, chevron –
 * expands in place. Min. 60px high (comfortable touch target on phones).
 */
export const AccountSection: React.FC<AccountSectionProps> = ({
  value,
  icon: Icon,
  title,
  description,
  destructive = false,
  className,
  children,
}) => (
  <AccordionItem value={value} className={cn('group/section border-b border-border/50', className)}>
    <AccordionTrigger className="min-h-15 items-center gap-4 rounded-none px-4 py-3 transition-colors hover:bg-foreground/[0.03] focus-visible:bg-foreground/[0.05] focus-visible:ring-0 active:bg-foreground/[0.06] [&>svg]:translate-y-0 [&>svg]:text-muted-foreground">
      <Icon
        aria-hidden="true"
        className={cn(
          'size-5 shrink-0 transition-colors',
          destructive
            ? 'text-destructive'
            : 'text-muted-foreground group-data-[open]/section:text-foreground'
        )}
        strokeWidth={1.75}
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-body leading-5 font-normal group-data-[open]/section:font-bold',
            destructive ? 'text-destructive' : 'text-foreground'
          )}
        >
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-caption leading-4 font-normal text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </AccordionTrigger>
    <AccordionContent className="px-4 pt-1 pb-6 text-foreground">{children}</AccordionContent>
  </AccordionItem>
);
