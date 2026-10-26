import React from 'react';

export interface ChangePasswordFormHeaderProps {
  title?: string;
  description?: string;
  className?: string;
}

export const ChangePasswordFormHeader: React.FC<ChangePasswordFormHeaderProps> = ({
  title,
  description,
  className,
}) => {
  if (!title && !description) return null;

  return (
    <div className={className ?? 'mb-6 text-center space-y-1'}>
      {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
      {description && <p className="text-body leading-5 text-muted-foreground">{description}</p>}
    </div>
  );
};
