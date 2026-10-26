/** Same shapes as the runtime (`shared/seo/types.ts`). */

export const SEO_SCHEMA_TYPES = [
  'none',
  'WebPage',
  'Article',
  'AboutPage',
  'ContactPage',
  'CollectionPage',
] as const;
export type SeoSchemaType = (typeof SEO_SCHEMA_TYPES)[number];

export interface ISeoSettings {
  siteName: string;
  /** `%s` = page title. */
  titleTemplate: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle: string;
  logo: string;
  sameAs: string[];
  indexing: boolean;
  /** Absolute frontend url (`FRONTEND_URL` of the runtime). */
  siteUrl: string;
}

/** Meta data of one path (`/timeline`) or of every path below a prefix (`/news/*`). */
export interface ISeoRouteMeta {
  id: string;
  path: string;
  title: string;
  description: string;
  image: string;
  index: boolean;
  schemaType: SeoSchemaType;
  jsonLd: Record<string, unknown> | null;
}

export interface ISeoConfig {
  settings: ISeoSettings;
  routes: ISeoRouteMeta[];
}

/** What a page knows better than the admin entry (`useSeo`) – every field optional. */
export interface ISeoPageMeta {
  title?: string;
  description?: string;
  image?: string;
  /** `article` for posts / pages with a date, otherwise `website`. */
  type?: 'website' | 'article';
  schemaType?: SeoSchemaType;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  noindex?: boolean;
  /** Extra JSON-LD node(s) of the page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/** Everything that ends up in `<head>`. */
export interface ISeoHead {
  /** `document.title` (with template). */
  documentTitle: string;
  /** Title without template (Open Graph / X). */
  title: string;
  description: string;
  canonical: string;
  image: string;
  robots: string;
  siteName: string;
  type: 'website' | 'article';
  locale: string;
  twitterHandle: string;
  jsonLd: Record<string, unknown> | null;
}
