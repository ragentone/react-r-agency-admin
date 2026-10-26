import { UserLoginMutation } from '@core/auth/graphql';
import type { ILoginParams } from '@core/auth/types';
import type { UserLoginReturn } from '@core/auth/types';
import { useGraphQl } from '@core/mesh';
import { useCallback, useState } from 'react';

export const useUserLogin = () => {
  const { mutate } = useGraphQl();
  const [loading, setLoading] = useState(false);

  const login = useCallback(
    async (params: ILoginParams): Promise<UserLoginReturn | null | undefined> => {
      setLoading(true);
      try {
        const response = await mutate({
          mutation: UserLoginMutation,
          variables: {
            params,
          },
        });
        return response.data?.userLogin;
      } finally {
        setLoading(false);
      }
    },
    [mutate]
  );

  return {
    login,
    loading,
  };
};
