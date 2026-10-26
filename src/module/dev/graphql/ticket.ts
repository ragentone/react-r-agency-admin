import { graphql } from '@generated/graphql';

/** Public – no login needed. */
export const DeveloperRoadmapListQuery = graphql(`
  query DeveloperRoadmapList {
    developerRoadmapList {
      success
      items
    }
  }
`);

export const DeveloperTicketCreateMutation = graphql(`
  mutation DeveloperTicketCreate($values: JSON!) {
    developerTicketCreate(values: $values) {
      success
      ticket
    }
  }
`);

export const DeveloperTicketMineQuery = graphql(`
  query DeveloperTicketMine {
    developerTicketMine {
      success
      tickets
    }
  }
`);

/** Devs only. */
export const DeveloperTicketListQuery = graphql(`
  query DeveloperTicketList($status: String) {
    developerTicketList(status: $status) {
      success
      tickets
    }
  }
`);

export const DeveloperTicketAcceptMutation = graphql(`
  mutation DeveloperTicketAccept($id: ID!, $note: String, $public: Boolean) {
    developerTicketAccept(id: $id, note: $note, public: $public) {
      success
      ticket
      todo
    }
  }
`);

export const DeveloperTicketRejectMutation = graphql(`
  mutation DeveloperTicketReject($id: ID!, $note: String!) {
    developerTicketReject(id: $id, note: $note) {
      success
      ticket
    }
  }
`);
