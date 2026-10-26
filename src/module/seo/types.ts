import type { ISeoSettings, SeoSchemaType } from '@core/seo/types';

import type { SEO_CHANGEFREQS } from './const';

export type SeoChangefreq = (typeof SEO_CHANGEFREQS)[number];
export type SeoTab = 'routes' | 'settings' | 'sitemap';

/** Full entry as the admin sees it (runtime `ISeoRoute`). */
export interface ISeoRoute {
  id: string;
  path: string;
  title: string;
  description: string;
  image: string;
  index: boolean;
  inSitemap: boolean;
  changefreq: SeoChangefreq;
  priority: number;
  schemaType: SeoSchemaType;
  jsonLd: Record<string, unknown> | null;
  updatedAt: string | null;
}

/** Form values – `jsonLd` as text (validated before saving). */
export interface ISeoRouteValues extends Omit<ISeoRoute, 'id' | 'updatedAt' | 'jsonLd'> {
  jsonLd: string;
}

export type ISeoSettingsValues = Omit<ISeoSettings, 'siteUrl'>;

export interface ISeoSitemapEntry {
  url: string;
  changefreq: SeoChangefreq;
  priority: number;
  lastmod?: string;
  /** `seo` = entry of this page, otherwise the app (`site-page` …). */
  source: string;
}

export interface ISeoSitemapStatus {
  url: string;
  generatedAt: string | null;
  entries: ISeoSitemapEntry[];
  error: string | null;
}

export interface ISeoOverview {
  settings: ISeoSettings;
  routes: ISeoRoute[];
  sitemap: ISeoSitemapStatus;
}

/** Result of a save: `error` = translation key (`error.*`), `field` = form field. */
export interface ISeoSaveResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  field?: string | null;
}
