import { cn } from '@ui/lib/utils';
import { memo } from 'react';

import type { EmojiItem, EmojiSkinTone } from '../types';

export interface EmojiPickerSectionProps {
  id: string;
  label: string;
  emojis: EmojiItem[];
  skin: EmojiSkinTone;
  /** Makes the first emoji reachable with Tab. */
  tabbable?: boolean;
}

/**
 * One labelled block of emojis. Memoized and free of handlers – clicks, hover
 * and keyboard are delegated to the picker so hover previews don't re-render
 * ~1,900 buttons.
 */
export const EmojiPickerSection = memo(function EmojiPickerSection({
  id,
  label,
  emojis,
  skin,
  tabbable = false,
}: EmojiPickerSectionProps) {
  return (
    <section data-section={id} aria-label={label}>
      <div className="sticky top-0 z-10 bg-popover/95 px-1 pt-2 pb-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
        {label}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,var(--emoji-cell))] justify-between">
        {emojis.map((emoji, index) => (
          <button
            key={emoji.id}
            type="button"
            data-emoji={emoji.id}
            aria-label={emoji.name}
            tabIndex={tabbable && index === 0 ? 0 : -1}
            className={cn(
              'emoji-native flex size-(--emoji-cell) items-center justify-center rounded-md text-(length:--emoji-size)',
              'transition-[background-color,transform] hover:bg-accent active:scale-90',
              'focus-visible:bg-accent focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none'
            )}
          >
            {emoji.skins[skin] ?? emoji.skins[0]}
          </button>
        ))}
      </div>
    </section>
  );
});
