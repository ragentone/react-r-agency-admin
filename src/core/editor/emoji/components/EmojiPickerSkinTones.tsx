import { cn } from '@ui/lib/utils';
import { useTranslation } from 'react-i18next';

import type { EmojiSkinTone } from '../types';
import { EMOJI_SKIN_HANDS, EMOJI_SKIN_TONES } from './emoji-skin-tones.const.ts';

interface EmojiPickerSkinTonesProps {
  value: EmojiSkinTone;
  onChange: (tone: EmojiSkinTone) => void;
}

export function EmojiPickerSkinTones({ value, onChange }: EmojiPickerSkinTonesProps) {
  const { t } = useTranslation('editor');

  return (
    <div
      role="radiogroup"
      aria-label={t('emoji.skinTone')}
      className="flex h-9 flex-1 items-center justify-between rounded-md bg-muted px-1"
    >
      {EMOJI_SKIN_TONES.map(tone => (
        <button
          key={tone}
          type="button"
          role="radio"
          aria-checked={value === tone}
          aria-label={t(`emoji.skins.${tone}`)}
          autoFocus={value === tone}
          onClick={() => onChange(tone)}
          className={cn(
            'emoji-native flex size-7 items-center justify-center rounded-md text-lg transition-colors hover:bg-background',
            'focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none',
            value === tone && 'bg-background shadow-xs'
          )}
        >
          {EMOJI_SKIN_HANDS[tone]}
        </button>
      ))}
    </div>
  );
}
