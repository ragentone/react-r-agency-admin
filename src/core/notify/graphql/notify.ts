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
  query UserNotifyState($scope: String) {
    userNotifyState(scope: $scope) { ${STATE_FIELDS} }
  }
`);

export const UserNotifyListingQuery = parse(`
  query UserNotifyListing($page: Int!, $limit: Int, $filter: String, $scope: String) {
    userNotifyListing(page: $page, limit: $limit, filter: $filter, scope: $scope) {
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
        scope
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
  mutation UserNotifySeenAll($scope: String) {
    userNotifySeenAll(scope: $scope) {
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
  mutation UserNotifyClear($scope: String) {
    userNotifyClear(scope: $scope) {
      success
      state { ${STATE_FIELDS} }
    }
  }
`);
