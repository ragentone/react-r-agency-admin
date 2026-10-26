import type { IRouterPageProps } from '@router/components';
import type { FunctionComponent } from 'react';

export type PageType = 'index' | 'auth' | 'account' | 'profile' | '404';

export interface IPageManager {
  setPage(type: PageType, page: FunctionComponent<IRouterPageProps>): void;
  getPage(type: PageType): FunctionComponent<IRouterPageProps>;
  hasPage(type: PageType): boolean;
}
