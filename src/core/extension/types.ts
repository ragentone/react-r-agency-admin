import type { IEvents } from '@core/event';
import type { ILocaleContext } from '@core/i18n';
import type { IThemeContext } from '@core/theme';
import type { NavigateFn, RouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import type { ILayoutContent } from '../layout/hooks/use.layout.content.ts';

export interface IExtensionContext {
  layout: {
    content: ILayoutContent;
  };
  theme: IThemeContext;
  locale: ILocaleContext;
  navigate: NavigateFn;
  routerState: RouterState;
  events: IEvents;
}

export interface IProps {
  index: number;
  context: IExtensionContext;
}

export type ExtensionComponent = (props: IProps) => null | ReactNode;

export interface IExtensionOptions {
  component: ExtensionComponent;
  sortOrder?: number;
  active?: boolean;
}

export interface IExtension extends IExtensionOptions {
  mounted: boolean;
  sortOrder: number;
  active: boolean;
}

export interface IExtensionManager {
  add(extension: IExtensionOptions): void;
}
