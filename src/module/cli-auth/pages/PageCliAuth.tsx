import { FullscreenPage } from '@ui/base/FullscreenPage';
import React from 'react';

import { CliAuthCard } from '../components/CliAuthCard';
import { CLI_CODE_PATTERN } from '../const';

/** Code aus `?code=` lesen – nur gültiges Format wird angezeigt. */
const readCode = (): string | null => {
  const code = new URLSearchParams(window.location.search).get('code')?.toUpperCase() ?? '';
  return CLI_CODE_PATTERN.test(code) ? code : null;
};

/** `/admin/cli-auth`: eigene Terminal-Anmeldung als Vollbild – öffentlich erreichbar, unabhängig vom Admin-Login. */
export const PageCliAuth: React.FC = () => {
  const code = readCode();
  return (
    <FullscreenPage
      open
      title="Terminal freigeben"
      layout="full"
      closeOnEscape={false}
      contentClassName="items-center justify-center overflow-y-auto px-5 py-8"
    >
      <div className="w-full max-w-[420px]">
        {code ? (
          <CliAuthCard code={code} />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-title font-bold">Kein gültiger Code</h1>
            <p className="text-body text-muted-foreground">
              Starte `runtime connect` im Terminal erneut.
            </p>
          </div>
        )}
      </div>
    </FullscreenPage>
  );
};
