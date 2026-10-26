import type { EmojiMartData } from '@emoji-mart/data';

import type { EmojiCategory, EmojiCategoryId, EmojiDataset, EmojiItem } from './types';

let cached: EmojiDataset | null = null;
let pending: Promise<EmojiDataset> | null = null;

function normalize(data: EmojiMartData): EmojiDataset {
  const byId = new Map<string, EmojiItem>();

  for (const emoji of Object.values(data.emojis)) {
    byId.set(emoji.id, {
      id: emoji.id,
      name: emoji.name,
      skins: emoji.skins.map(skin => skin.native),
      version: emoji.version,
      search: [
        emoji.id.replace(/_/g, ' '),
        emoji.name,
        ...emoji.keywords,
        ...(emoji.emoticons ?? []),
      ]
        .join(' ')
        .toLowerCase(),
    });
  }

  const categories: EmojiCategory[] = data.categories.map(category => ({
    id: category.id as EmojiCategoryId,
    emojis: category.emojis.map(id => byId.get(id)).filter((e): e is EmojiItem => !!e),
  }));

  return { categories, byId, all: categories.flatMap(c => c.emojis) };
}

/** Loads the emoji dataset once (separate chunk), subsequent calls share the result. */
export function loadEmojiData(): Promise<EmojiDataset> {
  pending ??= import('@emoji-mart/data').then(module => {
    cached = normalize((module as unknown as { default: EmojiMartData }).default);
    return cached;
  });
  return pending;
}

export function getCachedEmojiData(): EmojiDataset | null {
  return cached;
}

/** Every search term must match; results starting with the query rank first. */
export function searchEmojis(emojis: EmojiItem[], query: string, limit = 120): EmojiItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const first = terms[0];

  return emojis
    .filter(emoji => terms.every(term => emoji.search.includes(term)))
    .map(emoji => ({
      emoji,
      score: emoji.id.startsWith(first) ? 0 : emoji.name.toLowerCase().startsWith(first) ? 1 : 2,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(entry => entry.emoji);
}
