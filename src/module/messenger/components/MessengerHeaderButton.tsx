import { cn } from '@ui/lib/utils.ts';
import React from 'react';

/** Round icon button of the messenger headers – monochrome (grey circle or plain). */
export const MessengerHeaderButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'muted' | 'plain' }
>(({ className, tone = 'muted', ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'grid size-9 shrink-0 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40',
      tone === 'muted' && 'bg-foreground/6 text-foreground hover:bg-foreground/10',
      tone === 'plain' && 'text-foreground hover:bg-foreground/6',
      className
    )}
    {...props}
  />
));
MessengerHeaderButton.displayName = 'MessengerHeaderButton';
