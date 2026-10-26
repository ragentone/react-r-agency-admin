import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@ui/shad-cn/components/drawer.tsx';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { compareVersions } from '../api';
import { PWA_STORAGE_SEEN_VERSION } from '../const';
import type { IPwaRelease } from '../types';

const readSeen = () => {
  try {
    return localStorage.getItem(PWA_STORAGE_SEEN_VERSION);
  } catch {
    return null;
  }
};
const writeSeen = (value: string) => {
  try {
    localStorage.setItem(PWA_STORAGE_SEEN_VERSION, value);
  } catch {
    /* private mode – ignore */
  }
};

/**
 * "What's new in 1.1.0" – once per browser after updating to a minor / major version with notes.
 * The very first visit only remembers the version (nothing to compare with).
 */
export const PwaWhatsNew = ({ own }: { own: IPwaRelease | null }) => {
  const { t } = useTranslation('pwa');
  const [shown, setShown] = useState<IPwaRelease | null>(null);
  // Checked once per known version of this tab (state adjusted while rendering, no effect).
  const [checked, setChecked] = useState<string | null>(null);
  if (own?.version && checked !== own.version) {
    setChecked(own.version);
    const seen = readSeen();
    writeSeen(own.version);
    if (
      seen &&
      compareVersions(own.version, seen) > 0 &&
      own.bump !== 'patch' &&
      own.notes.length > 0
    ) {
      setShown(own);
    }
  }

  return (
    <Drawer open={Boolean(shown)} onOpenChange={open => !open && setShown(null)}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <div
          data-slot="pwa-whats-new"
          className="flex flex-col px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-foreground/15" aria-hidden />
          <div className="flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-foreground text-background">
              <Sparkles className="size-7" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <DrawerTitle className="text-title font-extrabold tracking-tight">
                {t('whatsNew.title', { version: shown?.version ?? '' })}
              </DrawerTitle>
              <DrawerDescription className="mt-0.5 text-caption text-muted-foreground">
                {t('whatsNew.text')}
              </DrawerDescription>
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            {shown?.notes.map(note => (
              <li key={note} className="flex items-start gap-3 text-body">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground"
                />
                <span className="min-w-0">{note}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setShown(null)}
            className="mt-6 h-12 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-90"
          >
            {t('whatsNew.done')}
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
