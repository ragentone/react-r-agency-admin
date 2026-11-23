import { parse } from 'graphql';

/** Replies of a request – page team and the signed-in requester. */
export const ShopRequestReplyListQuery = parse(`
  query ShopRequestReplyList($id: ID!) {
    shopRequestReplyList(id: $id) {
      success
      replies
    }
  }
`);

/** Adds a reply to a request. */
export const ShopRequestReplyCreateMutation = parse(`
  mutation ShopRequestReplyCreate($id: ID!, $message: String!) {
    shopRequestReplyCreate(id: $id, message: $message) {
      success
      replies
    }
  }
`);

/** Own requests of the signed-in user. */
export const ShopRequestMineQuery = parse(`
  query ShopRequestMine {
    shopRequestMine {
      success
      requests
    }
  }
`);
