import { parse } from 'graphql';

/** Sends a request for an item – signed in, or as guest with name + e-mail and captcha. */
export const ShopRequestCreateMutation = parse(`
  mutation ShopRequestCreate($id: ID!, $values: JSON!, $captchaToken: String) {
    shopRequestCreate(id: $id, values: $values, captchaToken: $captchaToken) {
      success
      requests
    }
  }
`);

/** Requests of a shop – owner and moderators only. */
export const ShopRequestListQuery = parse(`
  query ShopRequestList($id: ID!) {
    shopRequestList(id: $id) {
      success
      requests
    }
  }
`);

/** Changes the status of a request (`new`, `done`, `declined`). */
export const ShopRequestStatusMutation = parse(`
  mutation ShopRequestStatus($id: ID!, $status: String!) {
    shopRequestStatus(id: $id, status: $status) {
      success
      requests
    }
  }
`);

/** Deletes a request – owner and moderators only. */
export const ShopRequestDeleteMutation = parse(`
  mutation ShopRequestDelete($id: ID!) {
    shopRequestDelete(id: $id) {
      success
    }
  }
`);

/** Sets or clears the job value of a request in cents – owner and moderators only. */
export const ShopRequestValueMutation = parse(`
  mutation ShopRequestValue($id: ID!, $valueCents: Int) {
    shopRequestValue(id: $id, valueCents: $valueCents) {
      success
      requests
    }
  }
`);
