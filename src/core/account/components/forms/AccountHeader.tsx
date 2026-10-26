import { cn } from '@ui/lib/utils';
import React from 'react';

export interface AccountHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export const AccountHeader: React.FC<AccountHeaderProps> = ({ title, description, className }) => {
  if (!title && !description) return null;

  return (
    <div className={cn('space-y-1 mb-4', className)}>
      {title && <h3 className="text-base font-semibold tracking-tight">{title}</h3>}
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
    </div>
  );
};
