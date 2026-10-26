import { Alert, AlertDescription } from '@ui/shad-cn/components/alert';
import React from 'react';

export interface CreatePasswordFormAlertProps {
  message?: string | null;
  className?: string;
}

export const CreatePasswordFormAlert: React.FC<CreatePasswordFormAlertProps> = ({
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
