import { CheckCircle2 } from 'lucide-react';
import React, { useEffect } from 'react';

/** Kurz sichtbar lassen, dann Tab schließen (best effort). */
const CLOSE_DELAY_MS = 2000;

/**
 * Bestätigung statt Formular: das Terminal ist freigegeben.
 * `window.close()` klappt nur, wenn der Browser den Tab als skript-geöffnet ansieht – sonst
 * ignoriert er den Aufruf und die Meldung „Fenster schließen“ bleibt stehen.
 */
export const CliAuthSuccess: React.FC = () => {
  useEffect(() => {
    const timer = window.setTimeout(() => window.close(), CLOSE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div role="status" className="flex flex-col items-center gap-3 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-foreground text-background">
        <CheckCircle2 className="size-5" aria-hidden="true" />
      </span>
      <h1 className="text-title font-bold">Terminal verbunden</h1>
      <p className="text-body text-muted-foreground">
        Du kannst dieses Fenster schließen und im Terminal weiterarbeiten.
      </p>
    </div>
  );
};
