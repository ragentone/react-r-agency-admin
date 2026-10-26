import type { IAnimation } from '@core/components';
import type { ICmsContainerRegister } from 'cms/global';
import type { CSSProperties, FunctionComponent, ReactNode } from 'react';

export type CmsItemPosition = 'before' | 'after';
export type CmsItemsCollection = Partial<Record<keyof ICmsContainerRegister, ICmsRegisteredItem[]>>;

export type CmsComponent<Payload = Record<string, any>> = FunctionComponent<
  ICmsComponentProps<Payload>
>;

export interface ICmsRenderArgs<Payload = Record<string, any>> {
  id: string;
  node: ReactNode;
  index: number;
  position: CmsItemPosition;
  payload?: Payload;
}

export interface ICmsComponentProps<Payload = Record<string, any>> {
  index: number;
  payload?: Payload;
  state: ICmsItemState;
  ready(delay?: number): void;
}

export interface ICmsContainerProps<Payload = Record<string, any>> {
  name: keyof ICmsContainerRegister;
  render?: (args: ICmsRenderArgs) => ReactNode;
  children?: ReactNode;
  payload?: Payload;
  wrapper?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface ICmsItemProps {
  component: ICmsRegisteredItem;
  index: number;
  payload?: Record<string, any>;
  wrapper: HTMLDivElement | null;
}

export interface ICmsItemAnimation {
  initial: IAnimation['initial'];
  animate: IAnimation['animate'];
  exit: IAnimation['exit'];
  transition: IAnimation['transition'];
}

export interface ICmsRegisterOptions<Payload> {
  /**
   * Stable id of the registration. Registering the same id again replaces the entry
   * (hot reload). Default: `<container>:<component name>:<position>`.
   */
  id?: string;
  component: CmsComponent<Payload>;
  sortOrder?: number;
  disabled?: boolean;
  position?: CmsItemPosition;
  payload?: Payload;
  async?: boolean;
  animation?: ICmsItemAnimation;
  style?: CSSProperties;
  loading?: ReactNode;
  classes?: ICmsItemClasses;
}

export interface ICmsItemState {
  mounted: boolean;
  ready: boolean;
}

export interface ICmsItemClasses {
  wrapper?: string;
  inner?: string;
}

export interface ICmsRegisteredItem {
  id: string;
  component: CmsComponent;
  sortOrder: number;
  disabled: boolean;
  position: CmsItemPosition;
  async: boolean;
  animation?: ICmsItemAnimation;
  style?: CSSProperties;
  loading?: ReactNode;
  classes?: ICmsItemClasses;
}

export interface ICmsManager {
  collection: CmsItemsCollection;
  register<Key extends keyof ICmsContainerRegister>(
    key: Key,
    options: ICmsRegisterOptions<ICmsContainerRegister[Key]>
  ): void;
  // get<Key extends keyof ICmsContainerRegister>(
  //   key: Key,
  //   position?: CmsItemPosition
  // ): ICmsRegisteredItem[];
}
