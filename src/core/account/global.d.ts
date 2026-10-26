declare module 'cms/global' {
  import type { IUserAccount } from '@core/account/types';
  export interface ICmsContainerRegister {
    'page-account': { account: IUserAccount | undefined };
    'user-account-accordion': void;
  }
}

declare module 'event/global' {
  import type { IUserAccount } from '@core/account/types';

  export interface ICoreEventMap {
    'account:loaded': {
      payload: {
        account: IUserAccount | null | undefined;
      };
    };
  }
}
