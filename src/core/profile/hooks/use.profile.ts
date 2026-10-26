// noinspection ExceptionCaughtLocallyJS

import { useAuth } from '@core/auth/components/use.auth.ts';
import { useGraphQl, useMeshState } from '@core/mesh';
import { useCallback, useEffect, useRef, useState } from 'react';

import { UserLoadProfileQuery } from '../graphql';
import type {
  IUserProfile,
  IUserProfileParams,
  IUserProfileQueryResult,
  IUserProfileRelation,
  ProfileViewState,
} from '../types';

// Cast until codegen picked up graphql/load.ts (runs with `npm run dev`).
type QueryDocument = Parameters<ReturnType<typeof useGraphQl>['query']>[0]['query'];

const toError = (err: unknown) => (err instanceof Error ? err : new Error(String(err)));

/**
 * Loads a user profile (`userProfileLoad`) as soon as the mesh is connected.
 * Mount it per user (`key={userId}`) so switching profiles starts from a clean state;
 * responses of an older request are ignored.
 */
export const useProfile = (userId: string | null | undefined, enabled = true) => {
  const graphql = useGraphQl();
  const { connected } = useMeshState();

  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [params, setParams] = useState<IUserProfileParams | null>(null);
  const [relation, setRelation] = useState<IUserProfileRelation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [loaded, setLoaded] = useState(false);
  const requestRef = useRef(0);

  // No synchronous setState here – it also runs from the mount effect.
  const fetchProfile = useCallback(async () => {
    if (!userId) return null;
    const request = ++requestRef.current;
    try {
      const response = (await graphql.query({
        query: UserLoadProfileQuery as QueryDocument,
        variables: { id: userId },
      })) as { data?: IUserProfileQueryResult };
      if (request !== requestRef.current) return null;

      const result = response.data?.userProfileLoad ?? null;
      if (!result) throw new Error('userProfileLoad failed');
      setError(null);
      setProfile(result.profile ?? null);
      setParams(result.params ?? null);
      setRelation(result.relation ?? null);
      return result;
    } catch (err) {
      if (request !== requestRef.current) return null;
      setError(toError(err));
      return null;
    } finally {
      if (request === requestRef.current) {
        setLoading(false);
        setLoaded(true);
      }
    }
  }, [graphql, userId]);

  useEffect(() => {
    if (!connected || !userId || !enabled) return;
    // Same pattern as useAccount: start outside the effect body.
    queueMicrotask(() => void fetchProfile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, userId, enabled]);

  // Own profile open while the account changes (save, avatar, teaser → `userMeta` is replaced):
  // refresh silently, the profile stays visible meanwhile.
  const { userMeta } = useAuth();
  const ownMeta = userMeta?.id && userMeta.id === userId ? userMeta : null;
  const lastMeta = useRef(ownMeta);
  useEffect(() => {
    if (lastMeta.current === ownMeta) return;
    const changed = lastMeta.current !== null && ownMeta !== null;
    lastMeta.current = ownMeta;
    if (changed && enabled && loaded) queueMicrotask(() => void fetchProfile());
  }, [enabled, fetchProfile, loaded, ownMeta]);

  /** Manual reload (retry button) – shows the loading state again. */
  const reload = useCallback(() => {
    setLoading(true);
    setLoaded(false);
    setError(null);
    return fetchProfile();
  }, [fetchProfile]);

  let state: ProfileViewState;
  if (error) state = 'error';
  else if (!loaded) state = 'loading';
  else if (!params || params.notExists) state = 'notFound';
  else if (!params.canView) state = 'private';
  else if (profile) state = 'ready';
  else state = 'notFound';

  return { profile, params, relation, loading, error, state, reload };
};
