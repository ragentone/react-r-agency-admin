declare module 'cms/global' {
  import type { IProfileCmsPayload } from '@core/profile/types';
  export interface ICmsContainerRegister {
    'page-profile': IProfileCmsPayload;
  }
}
