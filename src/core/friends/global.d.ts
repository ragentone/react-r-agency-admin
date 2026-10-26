declare module 'cms/global' {
  import type { ICmsFriendsAcceptedListItem } from '@core/friends/types.ts';

  export interface ICmsContainerRegister {
    'friends-accepted-list-item': ICmsFriendsAcceptedListItem;
  }
}
