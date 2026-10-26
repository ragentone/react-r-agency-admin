import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import React from 'react';

export interface AccountAlertProps {
  type?: 'error' | 'success';
  title?: string;
  message?: string | null;
  className?: string;
}

export const AccountAlert: React.FC<AccountAlertProps> = ({
  type = 'error',
  title,
  message,
  className,
}) => {
  if (!message) return null;

  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle;

  return (
    <Alert variant={isError ? 'destructive' : 'default'} className={className}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
