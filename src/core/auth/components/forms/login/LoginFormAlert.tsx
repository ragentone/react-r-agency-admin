import { cn } from '@ui/lib/utils';
import { Alert, AlertDescription } from '@ui/shad-cn/components/alert';
import React from 'react';

export interface LoginFormAlertProps {
  message?: string | null;
  className?: string;
}

export const LoginFormAlert: React.FC<LoginFormAlertProps> = ({ message, className }) => {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="destructive" className={cn('gap-2', className)}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
