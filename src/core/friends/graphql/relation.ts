import { parse } from 'graphql';

/*
 * Parsed here instead of `graphql()` from codegen: operations codegen hasn't seen yet would be
 * empty objects and break the request. Backend: runtime shared/user/relation/relation.import.ts.
 */

const RELATION_FIELDS = `
  id
  relationId
  sourceId
  targetId
  requestBy
  blockedBy
  status
`;

export const UserRelationListQuery = parse(`
  query UserRelationList($limit: Int!, $offset: Int!, $status: String) {
    userRelationList(limit: $limit, offset: $offset, status: $status) {
      success
      total
      list
    }
  }
`);

export const UserRelationStateQuery = parse(`
  query UserRelationState($targetId: ID) {
    userRelationState(targetId: $targetId) {
      success
      relation { ${RELATION_FIELDS} }
    }
  }
`);

export const UserRelationRequestMutation = parse(`
  mutation UserRelationRequest($targetId: ID!) {
    userRelationRequest(targetId: $targetId) {
      success
      relationId
      relation { ${RELATION_FIELDS} }
    }
  }
`);

export const UserRelationCancelMutation = parse(`
  mutation UserRelationCancel($id: ID!) {
    userRelationCancel(id: $id) {
      success
    }
  }
`);

export const UserRelationAcceptMutation = parse(`
  mutation UserRelationAccept($id: ID!) {
    userRelationAccept(id: $id) {
      success
    }
  }
`);

export const UserRelationRejectMutation = parse(`
  mutation UserRelationReject($id: ID!) {
    userRelationReject(id: $id) {
      success
    }
  }
`);

export const UserRelationBlockMutation = parse(`
  mutation UserRelationBlock($sourceId: ID!, $targetId: ID!) {
    userRelationBlock(sourceId: $sourceId, targetId: $targetId) {
      success
      relation { ${RELATION_FIELDS} }
    }
  }
`);

export const UserRelationUnblockMutation = parse(`
  mutation UserRelationUnblock($sourceId: ID!, $targetId: ID!) {
    userRelationUnblock(sourceId: $sourceId, targetId: $targetId) {
      success
    }
  }
`);
