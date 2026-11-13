declare module 'cms/global' {
  import type { ICmsProfileButtonsPayload, IProfileCmsPayload } from '@core/profile/types';
  export interface ICmsContainerRegister {
    'page-profile': IProfileCmsPayload;
    'profile-call-buttons': ICmsProfileButtonsPayload;
  }
}
