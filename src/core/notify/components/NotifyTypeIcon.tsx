import { cn } from '@ui/lib/utils';
import { Bell, CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import React from 'react';

import type { NotifyType } from '../types';

const ICONS = {
  info: Bell,
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
} as const;

/** Type icon – `badge` = small circle on the sender's avatar, otherwise a 40px tile. */
export const NotifyTypeIcon: React.FC<{
  type: NotifyType;
  badge?: boolean;
  className?: string;
}> = ({ type, badge, className }) => {
  const Icon = ICONS[type] ?? Bell;
  const error = type === 'error';
  if (badge) {
    return (
      <span
        aria-hidden
        className={cn(
          'grid size-5 place-items-center rounded-full border-2 border-background',
          error ? 'bg-destructive text-white' : 'bg-foreground text-background',
          className
        )}
      >
        <Icon className="size-3" strokeWidth={2.75} />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-10 place-items-center rounded-full',
        error ? 'bg-destructive/10 text-destructive' : 'bg-foreground/[0.06] text-foreground',
        className
      )}
    >
      <Icon className="size-5" strokeWidth={2.25} />
    </span>
  );
};
