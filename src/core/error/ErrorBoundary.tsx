import React, { Component, type ComponentType, type ErrorInfo, type ReactNode } from 'react';

import { ErrorFallback } from './ErrorFallback.tsx';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorFallbackProps } from './types.ts';

/**
 * Robust, feature-rich React Error Boundary class component.
 * Catches JavaScript errors anywhere in the child component tree,
 * logs errors, and displays a graceful fallback UI with recovery mechanisms.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary caught error]:', error, errorInfo);
    }
  }

  public override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { hasError } = this.state;
    const { resetKeys } = this.props;

    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasKeyChanged = resetKeys.some(
        (key, index) => !Object.is(key, prevProps.resetKeys?.[index])
      );

      if (hasKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  public resetErrorBoundary = (...args: unknown[]): void => {
    this.props.onReset?.(...args);
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public override render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      fallbackRender,
      FallbackComponent,
      variant = 'fullscreen',
      title,
      description,
      showDetails = true,
    } = this.props;

    if (hasError && error) {
      const fallbackProps: ErrorFallbackProps = {
        error,
        errorInfo,
        resetErrorBoundary: this.resetErrorBoundary,
        reset: this.resetErrorBoundary,
        variant,
        title,
        description,
        showDetails,
      };

      if (fallbackRender) {
        return fallbackRender({
          error,
          resetErrorBoundary: this.resetErrorBoundary,
          errorInfo,
        });
      }

      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />;
      }

      if (React.isValidElement(fallback)) {
        return fallback;
      }

      if (typeof fallback === 'function') {
        return (fallback as (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode)(
          {
            error,
            resetErrorBoundary: this.resetErrorBoundary,
          }
        );
      }

      return <ErrorFallback {...fallbackProps} />;
    }

    return children;
  }
}

/**
 * Higher-Order Component (HOC) to wrap any component with an ErrorBoundary.
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  errorBoundaryProps?: ErrorBoundaryProps
): React.FC<P> {
  const ComponentWithErrorBoundary: React.FC<P> = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return ComponentWithErrorBoundary;
}
