import type { ISeoHead } from './types';

const OWNED = 'data-seo';

/** `<meta name|property=key content>` – created once, removed when the value is empty. */
const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!content) {
    if (element?.hasAttribute(OWNED)) element.remove();
    return;
  }
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    element.setAttribute(OWNED, '');
    document.head.appendChild(element);
  }
  if (element.content !== content) element.content = content;
};

const setCanonical = (href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    element.setAttribute(OWNED, '');
    document.head.appendChild(element);
  }
  if (element.href !== href) element.href = href;
};

const setJsonLd = (data: Record<string, unknown> | null) => {
  let element = document.head.querySelector<HTMLScriptElement>(
    `script[type="application/ld+json"][${OWNED}]`
  );
  if (!data) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement('script');
    element.type = 'application/ld+json';
    element.setAttribute(OWNED, '');
    document.head.appendChild(element);
  }
  // `</script>` inside a string must not end the tag.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  if (element.textContent !== json) element.textContent = json;
};

/** Writes the resolved head into the document. */
export const applySeoHead = (head: ISeoHead) => {
  if (document.title !== head.documentTitle) document.title = head.documentTitle;
  document.documentElement.lang = head.locale.split('-')[0] || document.documentElement.lang;

  setMeta('name', 'description', head.description);
  setMeta('name', 'robots', head.robots);
  setCanonical(head.canonical);

  setMeta('property', 'og:site_name', head.siteName);
  setMeta('property', 'og:type', head.type);
  setMeta('property', 'og:title', head.title);
  setMeta('property', 'og:description', head.description);
  setMeta('property', 'og:url', head.canonical);
  setMeta('property', 'og:image', head.image);
  setMeta('property', 'og:locale', head.locale.replace('-', '_'));

  setMeta('name', 'twitter:card', head.image ? 'summary_large_image' : 'summary');
  setMeta('name', 'twitter:site', head.twitterHandle ? `@${head.twitterHandle}` : '');
  setMeta('name', 'twitter:title', head.title);
  setMeta('name', 'twitter:description', head.description);
  setMeta('name', 'twitter:image', head.image);

  setJsonLd(head.jsonLd);
};
