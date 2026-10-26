import { authButtonSecondary } from '@core/auth/components/auth.styles.ts';
import { useAuth } from '@core/auth/components/use.auth.ts';
import { useUserGoogleAuth } from '@core/auth/hooks/use.user.google.auth.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import { Spinner } from '@ui/shad-cn/components/spinner';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" className={cn('shrink-0', className)} {...props}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export interface LoginFormGoogleButtonProps {
  label?: string;
  submittingLabel?: string;
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: Error | string) => void;
}

export const LoginFormGoogleButton: React.FC<LoginFormGoogleButtonProps> = ({
  label,
  submittingLabel,
  disabled,
  className,
  onSuccess,
  onError,
}) => {
  const { t } = useTranslation('auth');
  const { isLoggingIn } = useAuth();
  const [internalLoading, setInternalLoading] = useState(false);
  const { loginWithGoogle, loading: authLoading } = useUserGoogleAuth({
    onSuccess: () => {
      onSuccess?.();
    },
    onError: error => {
      onError?.(error.message || t('errors.googleAuthFailed'));
    },
  });

  const loading = internalLoading || authLoading || isLoggingIn;
  const isDisabled = disabled ?? loading;

  const displayLabel = label ?? t('form.google');
  const displaySubmittingLabel = submittingLabel ?? t('form.googleSubmitting');

  const handleClick = async () => {
    if (loading) return;
    setInternalLoading(true);
    try {
      await loginWithGoogle();
      onSuccess?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('errors.googleAuthFailed');
      onError?.(errorMsg);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(authButtonSecondary, 'gap-2.5', className)}
      disabled={isDisabled}
      onClick={handleClick}
    >
      {loading ? <Spinner className="mr-2" /> : <GoogleIcon />}
      {loading ? displaySubmittingLabel : displayLabel}
    </Button>
  );
};
