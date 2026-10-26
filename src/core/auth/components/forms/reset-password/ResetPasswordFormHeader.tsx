import { cn } from '@ui/lib/utils';
import React from 'react';

export interface ResetPasswordFormHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export const ResetPasswordFormHeader: React.FC<ResetPasswordFormHeaderProps> = ({
  title,
  description,
  className,
}) => {
  if (!title && !description) {
    return null;
  }

  return (
    <div className={cn('space-y-1 text-left pb-4', className)}>
      {description && <p className="text-body leading-5 text-muted-foreground">{description}</p>}
    </div>
  );
};
