const HIT_CLASS = ['rounded-sm', 'bg-foreground/15', 'text-foreground'];
/** The hit the user is on: inverted, like the current hit in a text editor. */
const ACTIVE_CLASS = ['bg-foreground', 'text-background'];

export interface IHighlightResult {
  /** HTML with every hit wrapped in `<mark data-hit="n">`. */
  html: string;
  count: number;
}

/**
 * Marks every case-insensitive hit of `query` in the (sanitized) HTML. Only text nodes are
 * touched, so the markup stays as it is. `active` is the hit index shown in the active style.
 * Pure function: React renders the result, no DOM is changed by hand.
 */
export const highlightHtml = (html: string, query: string, active: number): IHighlightResult => {
  const needle = query.trim().toLowerCase();
  if (!needle) return { html, count: 0 };

  const body = new DOMParser().parseFromString(html, 'text/html').body;
  const walker = body.ownerDocument.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  let hit = 0;
  for (const node of nodes) {
    const text = node.data;
    const lower = text.toLowerCase();
    let at = lower.indexOf(needle);
    if (at < 0) continue;

    const fragment = body.ownerDocument.createDocumentFragment();
    let from = 0;
    while (at >= 0) {
      if (at > from) fragment.append(text.slice(from, at));
      const mark = body.ownerDocument.createElement('mark');
      mark.dataset.hit = String(hit);
      mark.classList.add(...(hit === active ? ACTIVE_CLASS : HIT_CLASS));
      mark.textContent = text.slice(at, at + needle.length);
      fragment.append(mark);
      hit += 1;
      from = at + needle.length;
      at = lower.indexOf(needle, from);
    }
    if (from < text.length) fragment.append(text.slice(from));
    node.replaceWith(fragment);
  }
  return { html: body.innerHTML, count: hit };
};

/** Nearest ancestor that scrolls vertically (the drawer body), or null. */
const scrollParentOf = (element: HTMLElement): HTMLElement | null => {
  let node = element.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

/** Puts a hit into the middle of its scroll container (instant, no smooth animation). */
export const scrollToMatch = (mark: HTMLElement) => {
  const container = scrollParentOf(mark);
  if (!container) {
    mark.scrollIntoView({ block: 'center' });
    return;
  }
  const markBox = mark.getBoundingClientRect();
  const boxTop = container.getBoundingClientRect().top;
  container.scrollTop += markBox.top - boxTop - container.clientHeight / 2 + markBox.height / 2;
};
