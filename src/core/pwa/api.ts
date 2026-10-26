import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type { IPwaRelease, PwaReleaseBump } from './types';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
const VersionQuery = parse(`
  query SystemVersion($buildId: String) {
    systemVersion(buildId: $buildId) { success deploymentId buildId current own }
  }
`);

export interface IPwaLiveVersion extends IPwaRelease {
  deploymentId: string;
  buildId: string | null;
}

export interface IPwaVersionState {
  /** Newest live build (`null` = none known / error). */
  current: IPwaLiveVersion | null;
  /** Build of this tab (`null` = unknown: dev or a build before version management). */
  own: IPwaRelease | null;
}

const BUMPS: PwaReleaseBump[] = ['patch', 'minor', 'major'];

const str = (value: unknown) => (typeof value === 'string' && value ? value : null);

/** Server value → release (defensive: the runtime may be older than the frontend). */
export const toRelease = (value: unknown): IPwaRelease | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  return {
    version: str(data.version),
    bump: BUMPS.includes(data.bump as PwaReleaseBump) ? (data.bump as PwaReleaseBump) : null,
    notes: Array.isArray(data.notes)
      ? data.notes.filter((note): note is string => typeof note === 'string' && Boolean(note))
      : [],
    required: data.required === true,
  };
};

/** Live build + version of this tab according to the runtime. */
export const fetchLiveVersion = async (buildId: string | null): Promise<IPwaVersionState> => {
  try {
    const response = (await getMeshClient()
      .graphql()
      .query({
        query: VersionQuery as never,
        variables: { buildId },
        fetchPolicy: 'no-cache',
      })) as {
      data?: {
        systemVersion?: {
          success?: boolean;
          deploymentId?: string | null;
          buildId?: string | null;
          current?: unknown;
          own?: unknown;
        };
      };
    };
    const result = response.data?.systemVersion;
    if (!result?.success || !result.deploymentId) return { current: null, own: null };
    const release = toRelease(result.current) ?? {
      version: null,
      bump: null,
      notes: [],
      required: false,
    };
    return {
      current: { ...release, deploymentId: result.deploymentId, buildId: result.buildId ?? null },
      own: toRelease(result.own),
    };
  } catch {
    return { current: null, own: null };
  }
};

/** < 0: a older than b, 0: same, > 0: newer (unknown counts as oldest). */
export const compareVersions = (a: string | null | undefined, b: string | null | undefined) => {
  const parse = (value: string | null | undefined) =>
    /^\d+\.\d+\.\d+$/.test(value ?? '') ? (value as string).split('.').map(Number) : [-1, -1, -1];
  const left = parse(a);
  const right = parse(b);
  for (let index = 0; index < 3; index += 1) {
    if (left[index] !== right[index]) return left[index] - right[index];
  }
  return 0;
};
