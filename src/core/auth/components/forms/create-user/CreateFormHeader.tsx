import { cn } from '@ui/lib/utils';
import React from 'react';

export interface CreateFormHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export const CreateFormHeader: React.FC<CreateFormHeaderProps> = ({
  title,
  description,
  className,
}) => {
  if (!title && !description) {
    return null;
  }

  return (
    <div className={cn('space-y-1 pb-4', className)}>
      {description && <p className="text-body leading-5 text-muted-foreground">{description}</p>}
    </div>
  );
};
