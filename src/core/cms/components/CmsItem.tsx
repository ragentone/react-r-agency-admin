import { cn } from '@ui/lib';
import { Alert, AlertDescription, AlertTitle } from '@ui/shad-cn/components/alert.tsx';
import { useCallback, useEffect, useState } from 'react';

import { type ICmsItemProps, type ICmsItemState } from '../types.ts';
import { CmsLoadingSpinner } from './CmsLoadingSpinner.tsx';

/**
 * CmsComponent is a functional component that renders a given CMS component
 * within a container div element. It utilizes the properties passed through
 * the ICmsComponentProps interface to dynamically render the specified component.
 */
const CmsItem = (props: ICmsItemProps) => {
  const [state, setState] = useState<ICmsItemState>({
    mounted: false,
    ready: !props.component.async,
  });

  const ready = useCallback((delay: number = 0) => {
    setTimeout(() => {
      setState(prev => ({ ...prev, ready: true }));
    }, delay);
  }, []);

  useEffect(() => {
    const init = () => {
      setState(prev => ({ ...prev, mounted: true }));
    };
    init();
    return () => setState({ mounted: false, ready: false });
  }, []);

  const render = () => {
    if (!state.mounted) return null;
    try {
      return (
        <props.component.component
          ready={ready}
          state={state}
          payload={props.payload}
          index={props.index}
        />
      );
    } catch (e) {
      const error = e as Error;
      return (
        <Alert variant={'destructive'}>
          <AlertTitle>CMS render error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <div className={cn(props.component.classes?.wrapper, 'relative')}>
      {!state.ready && (
        <div className={'absolute left-0 right-0 top-0'}>
          {props.component.loading ? props.component.loading : <CmsLoadingSpinner />}
        </div>
      )}
      <div
        className={cn(props.component.classes?.inner, 'relative', {
          hidden: !state.ready,
        })}
      >
        {render()}
      </div>
    </div>
  );
};

export { CmsItem };
