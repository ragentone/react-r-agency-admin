import { cn } from '@ui/lib/utils';
import { Skeleton } from '@ui/shad-cn/components/skeleton';
import * as React from 'react';

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  fallback?: React.ReactNode;
  showSkeleton?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
  aspectRatio?: string | number;
  afterLoadDelay?: number;
}

export const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  (
    {
      src,
      alt = '',
      className,
      containerClassName,
      wrapperClassName,
      skeletonClassName,
      fallback,
      showSkeleton = true,
      rootMargin = '100px',
      threshold = 0.01,
      aspectRatio,
      style,
      onLoad,
      onError,
      loading = 'lazy',
      afterLoadDelay = 0,
      ...props
    },
    ref
  ) => {
    const [isInView, setIsInView] = React.useState<boolean>(false);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [hasError, setHasError] = React.useState<boolean>(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      setIsLoaded(false);
      setHasError(false);
    }, [src]);

    React.useEffect(() => {
      if (typeof window === 'undefined') {
        setIsInView(true);
        return;
      }

      if (loading === 'eager' || !('IntersectionObserver' in window)) {
        setIsInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin, threshold }
      );

      const target = containerRef.current;
      if (target) {
        observer.observe(target);
      }

      return () => {
        observer.disconnect();
      };
    }, [loading, rootMargin, threshold]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setTimeout(() => {
        setIsLoaded(true);
        setHasError(false);
        onLoad?.(e);
      }, afterLoadDelay);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(false);
      setHasError(true);
      onError?.(e);
    };

    const containerStyle: React.CSSProperties = {
      ...(aspectRatio !== undefined ? { aspectRatio: String(aspectRatio) } : {}),
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative inline-block overflow-hidden',
          wrapperClassName,
          containerClassName
        )}
        style={containerStyle}
      >
        {showSkeleton && !isLoaded && !hasError && (
          <Skeleton
            className={cn('absolute inset-0 h-full w-full rounded-[inherit]', skeletonClassName)}
          />
        )}

        {hasError
          ? (fallback ?? (
              <div
                className={cn(
                  'flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs',
                  skeletonClassName
                )}
              >
                Failed to load image
              </div>
            ))
          : isInView && (
              <img
                ref={ref}
                src={src}
                alt={alt}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                style={style}
                className={cn(
                  'h-full w-full object-cover transition-opacity duration-300 ease-in-out',
                  !isLoaded ? 'opacity-0' : 'opacity-100',
                  className
                )}
                {...props}
              />
            )}
      </div>
    );
  }
);

LazyImage.displayName = 'LazyImage';

export default LazyImage;
