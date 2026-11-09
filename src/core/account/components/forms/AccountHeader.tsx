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
    <div className={cn('mb-4 space-y-1', className)}>
      {title && <h3 className="text-title font-bold text-foreground">{title}</h3>}
      {description && <p className="text-caption text-muted-foreground">{description}</p>}
    </div>
  );
};
