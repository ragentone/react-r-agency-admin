import { useGraphQl, useGraphQlGetter } from '@core/mesh';
import { useCallback, useState } from 'react';

import {
  DeveloperTodoCreateMutation,
  DeveloperTodoDeleteMutation,
  DeveloperTodoListQuery,
  DeveloperTodoUpdateMutation,
} from '../graphql/todo';
import type { DevTodoStatus, IDevTodo, IDevTodoValues } from '../types';

type GraphQlClient = ReturnType<typeof useGraphQl>;
type QueryDocument = Parameters<GraphQlClient['query']>[0]['query'];
type MutationDocument = Parameters<GraphQlClient['mutate']>[0]['mutation'];

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 } as const;

/** Inside a column: high priority first, then newest. */
export const sortDevTodos = (todos: IDevTodo[]) =>
  [...todos].sort(
    (a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      b.createdAt.localeCompare(a.createdAt)
  );

/** Dev todos: load, create, edit, and status change (optimistic, rolled back on error). */
export const useDevTodos = () => {
  const getGraphql = useGraphQlGetter();
  const [todos, setTodos] = useState<IDevTodo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = (await getGraphql().query({
        query: DeveloperTodoListQuery as QueryDocument,
        fetchPolicy: 'no-cache',
      })) as { data?: { developerTodoList?: { success?: boolean; todos?: IDevTodo[] } } };
      const result = response.data?.developerTodoList;
      if (!result?.success) throw new Error('developerTodoList failed');
      setTodos(sortDevTodos(result.todos ?? []));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [getGraphql]);

  const create = useCallback(
    async (values: IDevTodoValues): Promise<IDevTodo | null> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: DeveloperTodoCreateMutation as MutationDocument,
          variables: { values },
        })) as { data?: { developerTodoCreate?: { success?: boolean; todo?: IDevTodo } } };
        const todo = response.data?.developerTodoCreate?.todo;
        if (!response.data?.developerTodoCreate?.success || !todo) throw new Error('create failed');
        setTodos(prev => sortDevTodos([todo, ...prev]));
        return todo;
      } catch {
        return null;
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  const update = useCallback(
    async (id: string, values: Partial<IDevTodoValues>): Promise<IDevTodo | null> => {
      setSaving(true);
      const before = todos;
      setTodos(prev =>
        sortDevTodos(prev.map(todo => (todo.id === id ? { ...todo, ...values } : todo)))
      );
      try {
        const response = (await getGraphql().mutate({
          mutation: DeveloperTodoUpdateMutation as MutationDocument,
          variables: { id, values },
        })) as { data?: { developerTodoUpdate?: { success?: boolean; todo?: IDevTodo } } };
        const todo = response.data?.developerTodoUpdate?.todo;
        if (!response.data?.developerTodoUpdate?.success || !todo) throw new Error('update failed');
        setTodos(prev => sortDevTodos(prev.map(item => (item.id === id ? todo : item))));
        return todo;
      } catch {
        setTodos(before);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [getGraphql, todos]
  );

  /** Hard delete (the board has no trash). Removes the card only after the backend confirmed. */
  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      setSaving(true);
      try {
        const response = (await getGraphql().mutate({
          mutation: DeveloperTodoDeleteMutation as MutationDocument,
          variables: { id },
        })) as { data?: { developerTodoDelete?: { success?: boolean } } };
        if (!response.data?.developerTodoDelete?.success) {
          // Log the raw response: GraphQL errors (e.g. unknown operation) end up here.
          console.warn('[dev-kanban] developerTodoDelete response', response);
          throw new Error('delete failed');
        }
        setTodos(prev => prev.filter(todo => todo.id !== id));
        return true;
      } catch (err) {
        console.warn('[dev-kanban] developerTodoDelete failed', err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [getGraphql]
  );

  const setStatus = useCallback(
    (id: string, status: DevTodoStatus) => update(id, { status }),
    [update]
  );

  return { todos, loading, loaded, saving, error, load, create, update, remove, setStatus };
};
