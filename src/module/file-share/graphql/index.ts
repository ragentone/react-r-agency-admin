import { graphql } from '@generated/graphql';

/** Public – guests only get `public` files. */
export const FileShareListQuery = graphql(`
  query FileShareList {
    fileShareList {
      success
      files
      restricted
    }
  }
`);

/** `admin:user` only. */
export const FileShareCreateMutation = graphql(`
  mutation FileShareCreate($values: JSON!, $file: [Upload]!) {
    fileShareCreate(values: $values, file: $file) {
      success
      file
    }
  }
`);

/** `admin:user` only – `file` replaces the stored file. */
export const FileShareUpdateMutation = graphql(`
  mutation FileShareUpdate($id: ID!, $values: JSON!, $file: [Upload]) {
    fileShareUpdate(id: $id, values: $values, file: $file) {
      success
      file
    }
  }
`);

/** `admin:user` only. */
export const FileShareDeleteMutation = graphql(`
  mutation FileShareDelete($id: ID!) {
    fileShareDelete(id: $id) {
      success
    }
  }
`);

/** `admin:user` only – new share link (an existing one stops working). */
export const FileShareLinkCreateMutation = graphql(`
  mutation FileShareLinkCreate($id: ID!) {
    fileShareLinkCreate(id: $id) {
      success
      file
    }
  }
`);

/** `admin:user` only – share link stops working. */
export const FileShareLinkRevokeMutation = graphql(`
  mutation FileShareLinkRevoke($id: ID!) {
    fileShareLinkRevoke(id: $id) {
      success
      file
    }
  }
`);

/** Public – file behind a share link (any visibility). */
export const FileShareLinkResolveQuery = graphql(`
  query FileShareLinkResolve($token: String!) {
    fileShareLinkResolve(token: $token) {
      success
      file
    }
  }
`);
