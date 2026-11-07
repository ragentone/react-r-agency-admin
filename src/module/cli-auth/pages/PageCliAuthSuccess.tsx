import { RoutePage } from '@router/components';
import { CheckCircle2 } from 'lucide-react';
import React from 'react';

/** Erfolgsseite: das Terminal ist freigegeben. */
export const PageCliAuthSuccess: React.FC = () => (
  <RoutePage width={480}>
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
        <CheckCircle2 className="size-5" aria-hidden="true" />
      </span>
      <h1 className="text-title font-bold">Terminal verbunden</h1>
      <p className="text-body text-muted-foreground">
        Du kannst dieses Fenster schließen und im Terminal weiterarbeiten.
      </p>
    </div>
  </RoutePage>
);
