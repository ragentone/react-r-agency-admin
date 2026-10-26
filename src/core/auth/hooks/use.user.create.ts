import { UserCreateMutation } from '@core/auth/graphql';
import type { UserCreateReturn } from '@core/auth/types';
import { useGraphQl } from '@core/mesh';
import type { UserCreateParams } from '@generated/graphql/graphql.ts';
import { useCallback, useState } from 'react';

export const useUserCreate = () => {
  const { mutate } = useGraphQl();
  const [loading, setLoading] = useState(false);

  const createUser = useCallback(
    async (params: UserCreateParams): Promise<UserCreateReturn | null | undefined> => {
      setLoading(true);
      try {
        const response = await mutate({
          mutation: UserCreateMutation,
          variables: {
            params,
          },
        });
        return response.data?.userCreate;
      } finally {
        setLoading(false);
      }
    },
    [mutate]
  );

  return {
    createUser,
    create: createUser,
    loading,
  };
};
