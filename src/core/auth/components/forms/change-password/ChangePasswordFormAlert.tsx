import { Alert, AlertDescription } from '@ui/shad-cn/components/alert';
import React from 'react';

export interface ChangePasswordFormAlertProps {
  message?: string | null;
  className?: string;
  variant?: 'destructive' | 'default';
}

export const ChangePasswordFormAlert: React.FC<ChangePasswordFormAlertProps> = ({
  message,
  className,
  variant = 'destructive',
}) => {
  if (!message) return null;

  return (
    <Alert variant={variant} className={className}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
