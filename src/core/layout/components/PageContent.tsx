import { useApp } from '@core/app';
import { Animation } from '@core/components';
import { parseCssWidthOrHeight } from '@core/utils';
import type { IRoutePageClasses } from '@router/components';
import { cn } from '@ui/lib';
import { type ReactNode, useEffect, useRef } from 'react';

interface IProps {
  children: ReactNode;
  scrollable?: boolean;
  mounted: boolean;
  width?: string | number;
  loading?: ReactNode;
  classes?: IRoutePageClasses;
}

/**
 * Component that provides content layout and rendering with optional scalability
 * and animation on mount.
 */
const PageContent = ({
  children,
  scrollable = false,
  mounted,
  width,
  loading,
  classes,
}: IProps) => {
  const { layout } = useApp();
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    layout.content.setElement(elementRef.current);
    return () => layout.content.setElement(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role={'route-page-inner'}
      className={cn('grow flex justify-center w-full h-full overflow-hidden', classes?.inner)}
    >
      <div
        role={'route-page-scroll'}
        ref={elementRef}
        className={cn(
          'relative flex flex-col h-full p-4 sm:border-x sm:border-border/50',
          {
            'overflow-auto': scrollable,
            'overflow-hidden': !scrollable,
          },
          classes?.scroll
        )}
        style={{
          width: parseCssWidthOrHeight(width, '820px'),
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {!mounted && loading && loading}
        <Animation
          role={'route-page-content'}
          className={cn(classes?.content)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          active={mounted}
          css={{
            width: '100%',
            height: '100%',
          }}
        >
          {children}
        </Animation>
      </div>
    </div>
  );
};

export { PageContent };
