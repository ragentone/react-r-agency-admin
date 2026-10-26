import { useEffect, useState } from 'react';

import { getCachedEmojiData, loadEmojiData } from '../data';
import type { EmojiDataset } from '../types';

export function useEmojiData(): EmojiDataset | null {
  const [data, setData] = useState<EmojiDataset | null>(getCachedEmojiData);

  useEffect(() => {
    if (data) return;
    let active = true;
    loadEmojiData().then(result => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, [data]);

  return data;
}
