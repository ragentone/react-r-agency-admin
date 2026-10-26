import type { ISeoSettings } from '@core/seo/types';
import { parse } from 'graphql';
import { getMeshClient } from 'r-agency-mesh-client-v1/release';

import type {
  ISeoOverview,
  ISeoRoute,
  ISeoRouteValues,
  ISeoSaveResult,
  ISeoSettingsValues,
  ISeoSitemapStatus,
} from './types';

/* Parsed here instead of codegen `graphql()` (works before Vite saw the new operation). */
const OverviewQuery = parse(`
  query AdminSeoOverview {
    adminSeoOverview { success error settings routes sitemap }
  }
`);
const RouteSaveMutation = parse(`
  mutation AdminSeoRouteSave($id: ID, $values: JSON!) {
    adminSeoRouteSave(id: $id, values: $values) { success error field route }
  }
`);
const RouteDeleteMutation = parse(`
  mutation AdminSeoRouteDelete($id: ID!) {
    adminSeoRouteDelete(id: $id) { success error field }
  }
`);
const SettingsSaveMutation = parse(`
  mutation AdminSeoSettingsSave($values: JSON!) {
    adminSeoSettingsSave(values: $values) { success error field settings }
  }
`);
const SitemapMutation = parse(`
  mutation AdminSeoSitemap {
    adminSeoSitemap { success error sitemap }
  }
`);

interface IRaw {
  success?: boolean;
  error?: string | null;
  field?: string | null;
  [key: string]: unknown;
}

const client = () => getMeshClient().graphql();

/** Runtime error code → translation key (`seo:error.*`). */
const errorKey = (code?: string | null) => {
  if (!code) return 'error.unknown';
  if (code === 'not_authorized') return 'error.notAuthorized';
  return code.startsWith('seo_') ? `error.${code.slice(4)}` : 'error.unknown';
};

const run = async <T>(
  operation: 'query' | 'mutate',
  doc: unknown,
  field: string,
  pick: (raw: IRaw) => T,
  variables?: Record<string, unknown>
): Promise<ISeoSaveResult<T>> => {
  try {
    const response = (
      operation === 'query'
        ? await client().query({ query: doc as never, variables, fetchPolicy: 'no-cache' })
        : await client().mutate({ mutation: doc as never, variables })
    ) as { data?: Record<string, IRaw | null> };
    const raw = response.data?.[field];
    if (!raw?.success) return { ok: false, error: errorKey(raw?.error), field: raw?.field };
    return { ok: true, data: pick(raw) };
  } catch (error) {
    console.warn('[admin-seo]', (error as Error)?.message);
    return { ok: false, error: 'error.network' };
  }
};

/** Form text → JSON for the runtime (empty JSON-LD = none). */
const routeInput = (values: ISeoRouteValues) => ({
  ...values,
  jsonLd: values.jsonLd.trim() ? JSON.parse(values.jsonLd) : null,
});

/** Admin only (`admin:user`, checked in the runtime `shared/seo`). */
export const SeoAdminApi = {
  overview: () =>
    run<ISeoOverview>('query', OverviewQuery, 'adminSeoOverview', raw => ({
      settings: raw.settings as ISeoSettings,
      routes: (raw.routes as ISeoRoute[]) ?? [],
      sitemap: raw.sitemap as ISeoSitemapStatus,
    })),
  saveRoute: (id: string | null, values: ISeoRouteValues) =>
    run<ISeoRoute>(
      'mutate',
      RouteSaveMutation,
      'adminSeoRouteSave',
      raw => raw.route as ISeoRoute,
      {
        id,
        values: routeInput(values),
      }
    ),
  deleteRoute: (id: string) =>
    run<true>('mutate', RouteDeleteMutation, 'adminSeoRouteDelete', () => true, { id }),
  saveSettings: (values: ISeoSettingsValues) =>
    run<ISeoSettings>(
      'mutate',
      SettingsSaveMutation,
      'adminSeoSettingsSave',
      raw => raw.settings as ISeoSettings,
      { values }
    ),
  sitemap: () =>
    run<ISeoSitemapStatus>(
      'mutate',
      SitemapMutation,
      'adminSeoSitemap',
      raw => raw.sitemap as ISeoSitemapStatus
    ),
};
