import { UserRole } from '@core/auth';
import { type IPageHeaderProps, PageContent, PageHeader } from '@core/layout';
import { cn } from '@ui/lib';
import { type ReactNode, useEffect } from 'react';

import { type IRouterPageContext, RoutePageProvider } from './RoutePageProvider';

export interface IRoutePageClasses {
  scroll?: string;
  content?: string;
  inner?: string;
}

export interface IRouterPageProps {
  scrollable?: boolean;
  mountedDelay?: number;
  async?: boolean;
  loading?: ReactNode;
  classes?: IRoutePageClasses;
}

type RenderFn = (context: IRouterPageContext) => ReactNode;

interface IProps {
  children: ReactNode | RenderFn;
  onMounted?: () => void;
  width?: string | number;
  userRole?: string[];
  header?: IPageHeaderProps;
}

const RoutePage = (props: IProps & IRouterPageProps) => {
  useEffect(() => {
    props.onMounted?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RoutePageProvider pageProps={props}>
      {ctx => (
        <UserRole role={props.userRole}>
          <div
            role={'router-page'}
            style={{
              height: '100%',
              width: '100%',
              maxHeight: '100%',
              maxWidth: '100%',
            }}
            className={cn('flex flex-col overflow-hidden')}
          >
            {props.header && <PageHeader {...props.header} width={props.width} />}
            <PageContent
              loading={props.loading}
              mounted={ctx.mounted}
              scrollable={props.scrollable}
              width={props.width}
              classes={props.classes}
            >
              {typeof props.children === 'function' ? props.children(ctx) : props.children}
            </PageContent>
          </div>
        </UserRole>
      )}
    </RoutePageProvider>
  );
};

export { RoutePage };
