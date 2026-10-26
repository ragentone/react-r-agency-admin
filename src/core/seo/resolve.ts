import type { ISeoConfig, ISeoHead, ISeoPageMeta, ISeoRouteMeta, ISeoSettings } from './types';

/** Paths that never belong in a search index (also `Disallow` in `public/robots.txt`). */
const PRIVATE_PATHS = [
  /^\/admin(\/|$)/,
  /^\/(auth|login|logout|user|accept|reject)(\/|$)/,
  /^\/files\/s\//,
  /^\/(transfer|meet)\/./,
];

export const normalizePath = (path: string) =>
  path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path || '/';

const isUnder = (prefix: string, path: string) => path === prefix || path.startsWith(`${prefix}/`);

/** Exact entry first, otherwise the longest `/*` prefix. Same rule as the runtime sitemap. */
export const matchRoute = (routes: ISeoRouteMeta[], pathname: string): ISeoRouteMeta | null => {
  const path = normalizePath(pathname);
  const exact = routes.find(route => route.path === path);
  if (exact) return exact;
  return (
    routes
      .filter(route => route.path.endsWith('/*') && isUnder(route.path.slice(0, -2) || '/', path))
      .sort((a, b) => b.path.length - a.path.length)[0] ?? null
  );
};

export const siteOrigin = (settings: ISeoSettings | null) =>
  (settings?.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '')).replace(
    /\/+$/,
    ''
  );

/** `/logo.png` → `https://site/logo.png`, absolute urls stay. */
export const absoluteUrl = (value: string, origin: string) =>
  !value
    ? ''
    : /^https?:\/\//i.test(value)
      ? value
      : `${origin}${value.startsWith('/') ? '' : '/'}${value}`;

export const applyTemplate = (template: string, title: string, siteName: string) => {
  if (!title) return siteName;
  const result = (template || '%s').replace('%s', title);
  return result.trim() || title;
};

const first = (...values: (string | null | undefined)[]) =>
  values.find(value => typeof value === 'string' && value.trim())?.trim() ?? '';

const clean = <T extends Record<string, unknown>>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(
      ([, item]) =>
        item !== '' && item !== null && item !== undefined && !(Array.isArray(item) && !item.length)
    )
  ) as T;

interface IResolveArgs {
  config: ISeoConfig | null;
  pathname: string;
  /** `meta.title` of the matched route (`Core.router.register`). */
  routeTitle?: string;
  page?: ISeoPageMeta | null;
  locale: string;
}

/**
 * Head of the current page. Order: page (`useSeo`) → admin entry for the path → route title →
 * site defaults.
 */
export const resolveSeoHead = ({
  config,
  pathname,
  routeTitle,
  page,
  locale,
}: IResolveArgs): ISeoHead => {
  const settings = config?.settings ?? null;
  const path = normalizePath(pathname);
  const route = config ? matchRoute(config.routes, path) : null;
  const origin = siteOrigin(settings);
  const siteName = settings?.siteName ?? '';

  const isHome = path === '/';
  const title = first(
    page?.title,
    route?.title,
    isHome ? settings?.defaultTitle : undefined,
    routeTitle,
    settings?.defaultTitle,
    siteName
  );
  const description = first(page?.description, route?.description, settings?.defaultDescription);
  const image = absoluteUrl(first(page?.image, route?.image, settings?.defaultImage), origin);
  const canonical = `${origin}${path === '/' ? '/' : path}`;

  const noindex =
    settings?.indexing === false ||
    route?.index === false ||
    page?.noindex === true ||
    PRIVATE_PATHS.some(pattern => pattern.test(path));

  const type = page?.type ?? (page?.publishedAt ? 'article' : 'website');
  const schemaType = page?.schemaType ?? route?.schemaType ?? 'WebPage';

  // Home title stays without template when it already is the full title.
  const documentTitle =
    isHome && settings?.defaultTitle && title === settings.defaultTitle
      ? title
      : applyTemplate(settings?.titleTemplate ?? '%s', title, siteName);

  return {
    documentTitle: documentTitle || 'Application',
    title,
    description,
    canonical,
    image,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    siteName,
    type,
    locale,
    twitterHandle: settings?.twitterHandle ?? '',
    jsonLd: noindex
      ? null
      : buildJsonLd({
          settings,
          origin,
          canonical,
          title,
          description,
          image,
          locale,
          schemaType,
          page,
          route,
        }),
  };
};

interface IJsonLdArgs {
  settings: ISeoSettings | null;
  origin: string;
  canonical: string;
  title: string;
  description: string;
  image: string;
  locale: string;
  schemaType: ISeoPageMeta['schemaType'];
  page?: ISeoPageMeta | null;
  route: ISeoRouteMeta | null;
}

/** `@graph`: WebSite + Organization (site settings) and the page node (schema type of the entry). */
const buildJsonLd = (args: IJsonLdArgs): Record<string, unknown> | null => {
  const {
    settings,
    origin,
    canonical,
    title,
    description,
    image,
    locale,
    schemaType,
    page,
    route,
  } = args;
  const graph: Record<string, unknown>[] = [];
  const websiteId = `${origin}/#website`;
  const orgId = `${origin}/#organization`;
  const siteName = settings?.siteName ?? '';

  if (siteName) {
    graph.push(
      clean({
        '@type': 'Organization',
        '@id': orgId,
        name: siteName,
        url: `${origin}/`,
        logo: settings?.logo ? absoluteUrl(settings.logo, origin) : '',
        sameAs: settings?.sameAs ?? [],
      }),
      clean({
        '@type': 'WebSite',
        '@id': websiteId,
        name: siteName,
        url: `${origin}/`,
        inLanguage: locale,
        publisher: { '@id': orgId },
      })
    );
  }

  if (schemaType && schemaType !== 'none') {
    const article = schemaType === 'Article';
    const node: Record<string, unknown> = clean({
      '@type': schemaType,
      '@id': `${canonical}#page`,
      url: canonical,
      name: article ? '' : title,
      headline: article ? title : '',
      description,
      image,
      inLanguage: locale,
      isPartOf: siteName ? { '@id': websiteId } : '',
      publisher: siteName && article ? { '@id': orgId } : '',
      datePublished: page?.publishedAt ?? '',
      dateModified: page?.modifiedAt ?? '',
    });
    // Admin JSON without its own `@type` adds fields to the page node.
    if (route?.jsonLd && !('@type' in route.jsonLd)) Object.assign(node, route.jsonLd);
    graph.push(node);
  }

  if (route?.jsonLd && '@type' in route.jsonLd) graph.push(route.jsonLd);
  const own = page?.jsonLd ? (Array.isArray(page.jsonLd) ? page.jsonLd : [page.jsonLd]) : [];
  graph.push(...own);

  return graph.length ? { '@context': 'https://schema.org', '@graph': graph } : null;
};
