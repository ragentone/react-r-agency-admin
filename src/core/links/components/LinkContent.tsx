import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { ExternalLink } from 'lucide-react';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LINK_ROUTE_BASE, LINK_SEARCH_KEY } from '../const.ts';
import { LinkManager } from '../manager.ts';
import type { ILinkEntry, LinkContentComponent } from '../types.ts';
import { sanitizeLinkHtml } from '../utils.ts';

/** Readable typography for HTML content (no typography plugin in the project). */
export const LINK_HTML_CLASS = [
  'text-body leading-relaxed text-foreground/90 break-words',
  '[&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground',
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-title [&_h2]:font-bold [&_h2]:text-foreground',
  '[&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-body [&_h3]:font-bold [&_h3]:text-foreground',
  '[&_h4]:mt-4 [&_h4]:mb-1 [&_h4]:font-semibold',
  '[&_p]:my-2.5 [&_address]:my-2.5 [&_address]:not-italic',
  '[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:my-1 [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2',
  '[&_hr]:my-6 [&_hr]:border-border/60 [&_small]:text-caption [&_small]:text-muted-foreground',
  '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3',
  '[&_table]:my-3 [&_table]:block [&_table]:overflow-x-auto [&_table]:text-caption',
  '[&_th]:border-b [&_th]:border-border/60 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left',
  '[&_td]:border-b [&_td]:border-border/40 [&_td]:px-2 [&_td]:py-1.5 [&_td]:align-top',
  '[&>*:first-child]:mt-0',
].join(' ');

const LinkContentSkeleton: React.FC = () => (
  <div className="space-y-3" aria-busy="true">
    <Skeleton className="h-5 w-1/2 rounded-full" />
    <Skeleton className="h-3 w-full rounded-full" />
    <Skeleton className="h-3 w-11/12 rounded-full" />
    <Skeleton className="h-3 w-4/5 rounded-full" />
    <Skeleton className="mt-6 h-5 w-1/3 rounded-full" />
    <Skeleton className="h-3 w-full rounded-full" />
    <Skeleton className="h-3 w-3/4 rounded-full" />
  </div>
);

const LinkContentError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  const { t } = useTranslation('links');
  return (
    <div role="alert" className="py-10 text-center">
      <p className="text-body text-muted-foreground">{t('error.load')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 h-10 rounded-full bg-foreground px-4 text-sm font-bold text-background"
        >
          {t('retry')}
        </button>
      )}
    </div>
  );
};

/** Link id of an internal href: `/link/terms` or legacy `?link=terms`. */
const internalLinkId = (href: string): string | null => {
  if (href.startsWith('?')) return new URLSearchParams(href).get(LINK_SEARCH_KEY);
  const prefix = `${LINK_ROUTE_BASE}/`;
  if (!href.startsWith(prefix)) return null;
  const id = href.slice(prefix.length).split(/[?#]/)[0];
  try {
    return id ? decodeURIComponent(id) : null;
  } catch {
    return null;
  }
};

/** `<a href="/link/terms">` inside HTML → opens that link page (no page reload). */
const openInternalLink = (event: React.MouseEvent<HTMLElement>) => {
  const anchor = (event.target as HTMLElement).closest('a');
  const id = internalLinkId(anchor?.getAttribute('href') ?? '');
  if (!id) return;
  event.preventDefault();
  LinkManager.open(id);
};

/** HTML content – string or (async) loader per language. */
const LinkHtml: React.FC<{
  html: string | ((lang: string) => string | Promise<string>);
}> = ({ html }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const [state, setState] = useState<{ key: string; html?: string; error?: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${lang}:${attempt}`;

  useEffect(() => {
    if (typeof html === 'string') return;
    let active = true;
    Promise.resolve()
      .then(() => html(lang))
      .then(
        value => active && setState({ key, html: value }),
        () => active && setState({ key, error: true })
      );
    return () => {
      active = false;
    };
  }, [html, lang, key]);

  const raw = typeof html === 'string' ? html : state?.key === key ? state.html : undefined;
  const safe = useMemo(() => (raw === undefined ? undefined : sanitizeLinkHtml(raw)), [raw]);

  if (typeof html !== 'string' && state?.key === key && state.error) {
    return <LinkContentError onRetry={() => setAttempt(value => value + 1)} />;
  }
  if (safe === undefined) return <LinkContentSkeleton />;
  return (
    <div
      className={LINK_HTML_CLASS}
      onClick={openInternalLink}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
};

/** One lazy component per loader – stays cached for the next open. */
const lazyCache = new Map<
  () => Promise<{ default: LinkContentComponent }>,
  React.LazyExoticComponent<LinkContentComponent>
>();
const lazyOf = (load: () => Promise<{ default: LinkContentComponent }>) => {
  let component = lazyCache.get(load);
  if (!component) {
    component = React.lazy(load);
    lazyCache.set(load, component);
  }
  return component;
};

/** Catches errors of content components (e.g. failed chunk load). */
class LinkContentBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <LinkContentError /> : this.props.children;
  }
}

export interface ILinkContentViewProps {
  link: ILinkEntry;
  close: () => void;
}

/** Renders the content of a link (on the link page `/link/<id>`). */
export const LinkContentView: React.FC<ILinkContentViewProps> = ({ link, close }) => {
  const { t } = useTranslation('links');
  const { content } = link;

  if (content.type === 'html') return <LinkHtml html={content.html} />;

  if (content.type === 'url') {
    // Deep link to an external link (normally opened directly in a new tab).
    return (
      <div className="py-8 text-center">
        <p className="text-body text-muted-foreground">{t('external.description')}</p>
        <a
          href={content.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background transition-opacity hover:opacity-85"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          {t('external.open')}
        </a>
      </div>
    );
  }

  // Lazy components are cached per loader (`lazyOf`) – same component on every render.
  const component = content.type === 'lazy' ? lazyOf(content.load) : content.component;
  return (
    <LinkContentBoundary key={link.id}>
      <Suspense fallback={<LinkContentSkeleton />}>
        {React.createElement(component, { link, close })}
      </Suspense>
    </LinkContentBoundary>
  );
};
