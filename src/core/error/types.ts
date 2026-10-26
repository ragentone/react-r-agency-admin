import type { ComponentType, ErrorInfo, ReactNode } from 'react';

export interface ErrorFallbackProps {
  error?: Error | unknown;
  errorInfo?: ErrorInfo | null;
  resetErrorBoundary?: () => void;
  /** Alias for resetErrorBoundary (compatible with TanStack Router ErrorComponentProps) */
  reset?: () => void;
  info?: ErrorInfo | { componentStack?: string } | null;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  showReloadButton?: boolean;
  showResetButton?: boolean;
  showDetails?: boolean;
  customAction?: ReactNode;
  className?: string;
  /** `fullscreen`: whole page (default) · `minimal`: compact card inside a section. */
  variant?: ErrorFallbackVariant;
}

export type ErrorFallbackVariant = 'fullscreen' | 'minimal';

export type FallbackRender = (props: {
  error: Error;
  resetErrorBoundary: () => void;
  errorInfo?: ErrorInfo | null;
}) => ReactNode;

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: FallbackRender;
  FallbackComponent?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: (...args: unknown[]) => void;
  resetKeys?: unknown[];
  title?: string;
  description?: string;
  showDetails?: boolean;
  variant?: ErrorFallbackVariant;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
