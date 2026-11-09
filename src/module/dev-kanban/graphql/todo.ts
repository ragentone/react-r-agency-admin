import { parse } from 'graphql';

/*
 * Dev todos: parsed directly – the admin codegen (`generated/graphql`) does not know these
 * operations yet, so `graphql()` would return an empty document.
 * Backend: `developerTodoList` / `developerTodoCreate` / `developerTodoUpdate` (admin only).
 */
export const DeveloperTodoListQuery = parse(`
  query DeveloperTodoList {
    developerTodoList {
      success
      todos
    }
  }
`);

export const DeveloperTodoCreateMutation = parse(`
  mutation DeveloperTodoCreate($values: JSON!) {
    developerTodoCreate(values: $values) {
      success
      todo
    }
  }
`);

export const DeveloperTodoUpdateMutation = parse(`
  mutation DeveloperTodoUpdate($id: ID!, $values: JSON!) {
    developerTodoUpdate(id: $id, values: $values) {
      success
      todo
    }
  }
`);

export const DeveloperTodoDeleteMutation = parse(`
  mutation DeveloperTodoDelete($id: ID!) {
    developerTodoDelete(id: $id) {
      success
      error
    }
  }
`);
