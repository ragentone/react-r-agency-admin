import { useAuth } from '@core/auth/components/use.auth.ts';
import { UserUploadAvatarMutation } from '@core/auth/graphql';
import type { UserUploadAvatarReturn } from '@core/auth/types';
import { useGraphQl } from '@core/mesh';
import { useCallback, useState } from 'react';

export const useUserAvatar = () => {
  const { mutate } = useGraphQl();
  const { userMeta, setUserMeta } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadAvatar = useCallback(
    async (file: File | Blob): Promise<UserUploadAvatarReturn | null | undefined> => {
      setLoading(true);
      setError(null);
      try {
        const fileObj =
          file instanceof File
            ? file
            : new File([file], 'avatar.jpg', { type: file.type || 'image/jpeg' });

        const response = await mutate({
          mutation: UserUploadAvatarMutation,
          variables: {
            file: [fileObj],
          },
        });

        const result = response.data?.userUploadAvatar;
        if (result?.success && result?.url) {
          setUserMeta({
            ...userMeta,
            avatarUrl: result.url,
          });
        }
        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutate, setUserMeta, userMeta]
  );

  return {
    uploadAvatar,
    loading,
    error,
  };
};

export const useUserUploadAvatar = useUserAvatar;
