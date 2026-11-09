import { Button } from '@ui/shad-cn/components/button.tsx';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@ui/shad-cn/components/drawer.tsx';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { usePwa } from './use.pwa.ts';

/**
 * Bottom drawer as soon as a new version is waiting – however it was detected (push, polling,
 * reconnect). Once per version it can be dismissed ("Später"); the settings dot stays as well.
 * Required versions cannot be dismissed. Opening is derived from state, so no effect is needed.
 */
export const PwaUpdateDrawer = () => {
  const { t } = useTranslation('pwa');
  const { needRefresh, update, available } = usePwa();
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const required = Boolean(available?.required);
  const key = available?.version ?? 'unknown';
  const open = needRefresh && (required || dismissedFor !== key);
  const notes = available?.notes.slice(0, 3) ?? [];

  const dismiss = () => {
    if (required || updating) return;
    setDismissedFor(key);
  };

  const onUpdate = () => {
    if (updating) return;
    setUpdating(true);
    // The page reloads once the new worker is active.
    void update();
  };

  return (
    <Drawer open={open} onOpenChange={next => !next && dismiss()}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <div
          data-slot="pwa-update"
          className="flex flex-col gap-5 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto h-1 w-10 rounded-full bg-foreground/15" aria-hidden />

          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-foreground text-background">
              <RefreshCw className="size-6" aria-hidden />
            </span>
            <div className="min-w-0">
              <DrawerTitle className="text-title font-extrabold tracking-tight">
                {available?.version ? t('update.titleVersion', { version: available.version }) : t('update.title')}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-caption text-muted-foreground">
                {required ? t('update.requiredText') : t('update.text')}
              </DrawerDescription>
            </div>
          </div>

          {notes.length > 0 && (
            <ul className="flex flex-col gap-2 rounded-2xl border border-border/50 p-4 text-body">
              {notes.map((note, index) => (
                <li key={index} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2">
            <Button size="lg" className="h-12 rounded-full text-body font-bold" onClick={onUpdate} disabled={updating}>
              {updating ? t('update.updating') : t('update.action')}
            </Button>
            {!required && (
              <Button
                variant="ghost"
                size="lg"
                className="h-12 rounded-full"
                onClick={dismiss}
                disabled={updating}
              >
                {t('update.later')}
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
