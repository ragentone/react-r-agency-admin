import {
  UserComparePasswordQuery,
  UserPasswordChange,
  UserPasswordCreate,
  UserResetPassword,
} from '@core/auth/graphql';
import type {
  UserPasswordChangeReturn,
  UserPasswordCreateReturn,
  UserPasswordResetReturn,
} from '@core/auth/types';
import { useGraphQl } from '@core/mesh';
import { useCallback, useState } from 'react';

export interface IChangePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export const useUserPassword = () => {
  const { mutate, query } = useGraphQl();
  const [loading, setLoading] = useState(false);

  const createPassword = useCallback(
    async (
      password: string,
      token: string
    ): Promise<UserPasswordCreateReturn | null | undefined> => {
      setLoading(true);
      try {
        const response = await mutate({
          mutation: UserPasswordCreate,
          variables: {
            password,
            token,
          },
        });
        return response.data?.userPasswordCreate;
      } finally {
        setLoading(false);
      }
    },
    [mutate]
  );

  const resetPassword = useCallback(
    async (email: string): Promise<UserPasswordResetReturn | null | undefined> => {
      setLoading(true);
      try {
        const response = await mutate({
          mutation: UserResetPassword,
          variables: {
            email,
          },
        });
        return response.data?.userPasswordReset;
      } finally {
        setLoading(false);
      }
    },
    [mutate]
  );

  const changePassword = useCallback(
    async ({
      userId,
      currentPassword,
      newPassword,
    }: IChangePasswordParams): Promise<UserPasswordChangeReturn | null | undefined> => {
      setLoading(true);
      try {
        const response = await mutate({
          mutation: UserPasswordChange,
          variables: {
            userId,
            currentPassword,
            newPassword,
          },
        });
        return response.data?.userPasswordChange;
      } finally {
        setLoading(false);
      }
    },
    [mutate]
  );

  const comparePassword = useCallback(
    async (pwd: string): Promise<boolean> => {
      setLoading(true);
      try {
        const response = await query({
          query: UserComparePasswordQuery,
          variables: {
            pwd,
          },
        });
        return response.data?.userComparePassword?.success ?? false;
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  return {
    createPassword,
    resetPassword,
    changePassword,
    comparePassword,
    create: createPassword,
    reset: resetPassword,
    change: changePassword,
    compare: comparePassword,
    loading,
  };
};
