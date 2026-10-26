import { cn } from '@ui/lib/utils';
import { Alert, AlertDescription } from '@ui/shad-cn/components/alert';
import { AlertCircle } from 'lucide-react';
import React from 'react';

export interface ResetPasswordFormAlertProps {
  message?: string | null;
  className?: string;
}

export const ResetPasswordFormAlert: React.FC<ResetPasswordFormAlertProps> = ({
  message,
  className,
}) => {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="destructive" className={cn('flex items-start gap-2', className)}>
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
