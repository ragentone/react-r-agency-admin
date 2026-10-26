declare module 'event/global' {
  import type {
    ILoginParams,
    IUserLoadConfig,
    IUserLoginReturn,
    IUserMeta,
  } from '@core/auth/types';

  export interface ICoreEventMap {
    'auth:config:loaded': {
      payload: {
        config: IUserLoadConfig | null | undefined;
      };
    };
    'auth:login:before': {
      payload: {
        params: ILoginParams;
      };
    };
    'auth:login:after': {
      payload: {
        result: IUserLoginReturn | null | undefined;
      };
    };
    'auth:logout:before': {
      payload: {
        userMeta: IUserMeta | null | undefined;
      };
    };
    'auth:logout:after': {
      payload: {
        userMeta: IUserMeta | null | undefined;
        success: boolean;
      };
    };
    /** Opens the logout confirm dialog (e.g. from the main menu) – `AuthProvider` handles it. */
    'auth:logout:request': {
      payload: undefined;
    };
    'auth:user_deleted_request': {
      payload: {
        pwd?: string;
      };
    };
  }
}
