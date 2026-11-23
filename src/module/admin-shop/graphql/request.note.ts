import { parse } from 'graphql';

/** Internal notes of the customer behind a request – owner and moderators only. */
export const ShopRequestNoteListQuery = parse(`
  query ShopRequestNoteList($id: ID!) {
    shopRequestNoteList(id: $id) {
      success
      notes
    }
  }
`);

/** Adds an internal note to a request. */
export const ShopRequestNoteCreateMutation = parse(`
  mutation ShopRequestNoteCreate($id: ID!, $message: String!) {
    shopRequestNoteCreate(id: $id, message: $message) {
      success
      notes
    }
  }
`);

/** Deletes a note (author or page owner). */
export const ShopRequestNoteDeleteMutation = parse(`
  mutation ShopRequestNoteDelete($id: ID!) {
    shopRequestNoteDelete(id: $id) {
      success
      notes
    }
  }
`);
