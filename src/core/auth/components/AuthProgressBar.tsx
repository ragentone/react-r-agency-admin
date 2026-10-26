import { cn } from '@ui/lib/utils';
import React from 'react';

export interface AuthProgressBarProps {
  active?: boolean;
  className?: string;
  message?: string;
  position?: 'top' | 'relative';
}

export const AuthProgressBar: React.FC<AuthProgressBarProps> = ({
  active = true,
  className,
  message,
  position = 'top',
}) => {
  if (!active) return null;

  return (
    <div
      className={cn(
        'w-full overflow-hidden transition-all duration-300 z-50',
        position === 'top' ? 'absolute top-0 left-0 right-0' : 'relative',
        className
      )}
    >
      <div className="relative h-1 w-full overflow-hidden bg-foreground/10">
        <div
          className="absolute inset-y-0 rounded-full bg-foreground transition-all duration-300"
          style={{
            animation: 'auth-indeterminate 1.4s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite',
          }}
        />
      </div>
      {message && (
        <div className="flex items-center justify-center border-b border-border/50 bg-background/85 px-3 py-2 text-caption font-medium text-muted-foreground backdrop-blur-md animate-in fade-in duration-200">
          <span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-foreground" />
          {message}
        </div>
      )}
      <style>{`
        @keyframes auth-indeterminate {
          0% {
            left: -35%;
            right: 100%;
          }
          60% {
            left: 100%;
            right: -90%;
          }
          100% {
            left: 100%;
            right: -90%;
          }
        }
      `}</style>
    </div>
  );
};
