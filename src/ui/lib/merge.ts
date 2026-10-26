import { extendTailwindMerge } from 'tailwind-merge';
import { createTV } from 'tailwind-variants';

/**
 * Custom type scale from `src/index.css` (`--text-micro` … `--text-display`).
 * tailwind-merge must know these as font sizes – otherwise `text-body` would be taken
 * for a color and dropped next to `text-foreground`.
 */
export const TYPE_SCALE = ['micro', 'caption', 'body', 'title', 'display'] as const;

const TW_MERGE_CONFIG = {
  extend: {
    theme: {
      text: [...TYPE_SCALE],
    },
  },
};

export const twMerge = extendTailwindMerge(TW_MERGE_CONFIG);

/**
 * `tv` with the same merge config. Always import `tv` from here, never from
 * `tailwind-variants` directly – its built-in merge doesn't know the type scale and drops
 * text colours like `text-primary-foreground` next to `text-caption` (unreadable buttons).
 */
export const tv = createTV({ twMergeConfig: TW_MERGE_CONFIG });
