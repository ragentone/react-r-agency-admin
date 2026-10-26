import { graphql } from '@generated/graphql';

export const DeveloperTodoListQuery = graphql(`
  query DeveloperTodoList {
    developerTodoList {
      success
      todos
    }
  }
`);

export const DeveloperTodoCreateMutation = graphql(`
  mutation DeveloperTodoCreate($values: JSON!) {
    developerTodoCreate(values: $values) {
      success
      todo
    }
  }
`);

export const DeveloperTodoUpdateMutation = graphql(`
  mutation DeveloperTodoUpdate($id: ID!, $values: JSON!) {
    developerTodoUpdate(id: $id, values: $values) {
      success
      todo
    }
  }
`);

export const DeveloperTodoDeleteMutation = graphql(`
  mutation DeveloperTodoDelete($id: ID!) {
    developerTodoDelete(id: $id) {
      success
    }
  }
`);
