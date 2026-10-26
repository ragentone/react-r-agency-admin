import { useAuth } from '@core/auth/components/use.auth.ts';
import { ResetUserTeaserMutation, UploadUserTeaserMutation } from '@core/auth/graphql';
import { useGraphQl } from '@core/mesh';
import { useCallback, useState } from 'react';

/**
 * Upload / remove the user's teaser (profile banner).
 * The backend converts it to WebP (width 1200) and notifies on success;
 * `userMeta.teaserUrl` is updated so every view shows the new banner at once.
 */
export const useUserTeaser = () => {
  const { mutate } = useGraphQl();
  const { userMeta, setUserMeta } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadTeaser = useCallback(
    async (file: File | Blob): Promise<string | null> => {
      setUploading(true);
      setError(null);
      try {
        const fileObj =
          file instanceof File
            ? file
            : new File([file], 'teaser.jpg', { type: file.type || 'image/jpeg' });
        const response = await mutate({
          mutation: UploadUserTeaserMutation,
          variables: { file: [fileObj] },
        });
        const result = response.data?.userUploadTeaser;
        if (!result?.success || !result.url) throw new Error('userUploadTeaser failed');
        setUserMeta({ ...userMeta, teaserUrl: result.url });
        return result.url;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setUploading(false);
      }
    },
    [mutate, setUserMeta, userMeta]
  );

  const resetTeaser = useCallback(async (): Promise<boolean> => {
    setRemoving(true);
    setError(null);
    try {
      const response = await mutate({ mutation: ResetUserTeaserMutation });
      if (!response.data?.userResetTeaser?.success) throw new Error('userResetTeaser failed');
      setUserMeta({ ...userMeta, teaserUrl: null });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setRemoving(false);
    }
  }, [mutate, setUserMeta, userMeta]);

  return { uploadTeaser, resetTeaser, uploading, removing, error };
};
