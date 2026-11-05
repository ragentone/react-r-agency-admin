export interface IDocSection {
  /** Anchor id in the rendered HTML (`doc-section-<n>`). */
  id: string;
  title: string;
  /** 1 = `#`, 2 = `##`, 3 = `###`. */
  level: number;
}

export interface IIndexedDoc {
  /** HTML with an `id` on every heading (same input → same ids). */
  html: string;
  sections: IDocSection[];
}

/** Gives every heading (h1–h3) of a rendered doc an id and lists them in document order. */
export const indexSections = (html: string): IIndexedDoc => {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  const sections: IDocSection[] = [];
  body.querySelectorAll<HTMLElement>('h1, h2, h3').forEach((heading, position) => {
    const id = `doc-section-${position}`;
    heading.id = id;
    sections.push({
      id,
      title: heading.textContent?.trim() ?? '',
      level: Number(heading.tagName.slice(1)),
    });
  });
  return { html: body.innerHTML, sections };
};
