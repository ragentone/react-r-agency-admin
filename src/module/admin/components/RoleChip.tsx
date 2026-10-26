import { cn } from '@ui/lib/utils';
import { Lock } from 'lucide-react';
import React from 'react';

import { splitRole } from '../utils';

interface IProps {
  role: string;
  locked?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/** `admin:user` as two-tone chip (`admin` bold, `:user` muted) – lock icon for protected roles. */
export const RoleChip: React.FC<IProps> = ({ role, locked = false, size = 'md', className }) => {
  const [scope, name] = splitRole(role);
  return (
    <span
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-1 rounded-full bg-foreground/[0.07] font-mono',
        size === 'sm' ? 'h-6 px-2 text-[11px]' : 'h-7 px-2.5 text-xs',
        className
      )}
    >
      {locked && <Lock className="size-3 shrink-0 opacity-70" aria-hidden="true" />}
      <span className="truncate">
        <span className="font-semibold text-foreground">{scope}</span>
        {name && <span className="text-muted-foreground">:{name}</span>}
      </span>
    </span>
  );
};
