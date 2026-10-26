import { parse } from 'graphql';

/*
 * Parsed here instead of `graphql()` from codegen (same as core/friends): operations codegen
 * hasn't seen yet would be empty objects. Backend: runtime actions/notify/runtime.conf.json.
 */

const STATE_FIELDS = `
  total
  unread
  hasNew
`;

export const UserNotifyStateQuery = parse(`
  query UserNotifyState {
    userNotifyState { ${STATE_FIELDS} }
  }
`);

export const UserNotifyListingQuery = parse(`
  query UserNotifyListing($page: Int!, $limit: Int, $filter: String) {
    userNotifyListing(page: $page, limit: $limit, filter: $filter) {
      success
      total
      hasNextPage
      state { ${STATE_FIELDS} }
      records {
        notifyId
        title
        message
        type
        date
        from { id alias avatarUrl }
        removable
        translate
        seen
        payload
        component
        identifier
        flash
        actions { label emit payload variant close delete }
      }
    }
  }
`);

export const UserNotifySeenMutation = parse(`
  mutation UserNotifySeen($notifyId: String!) {
    userNotifySeen(notifyId: $notifyId) {
      success
      state { ${STATE_FIELDS} }
    }
  }
`);

export const UserNotifySeenAllMutation = parse(`
  mutation UserNotifySeenAll {
    userNotifySeenAll {
      success
      state { ${STATE_FIELDS} }
    }
  }
`);

export const UserNotifyDeleteMutation = parse(`
  mutation UserNotifyDelete($notifyId: String!) {
    userNotifyDelete(notifyId: $notifyId) {
      success
      state { ${STATE_FIELDS} }
    }
  }
`);

export const UserNotifyClearMutation = parse(`
  mutation UserNotifyClear {
    userNotifyClear {
      success
      state { ${STATE_FIELDS} }
    }
  }
`);
