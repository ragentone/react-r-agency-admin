import { RoutePage } from '@router/components';
import React from 'react';

import { CliAuthCard } from '../components/CliAuthCard';
import { CLI_CODE_PATTERN } from '../const';

/** Code aus `?code=` lesen – nur gültiges Format wird angezeigt. */
const readCode = (): string | null => {
  const code = new URLSearchParams(window.location.search).get('code')?.toUpperCase() ?? '';
  return CLI_CODE_PATTERN.test(code) ? code : null;
};

/** `/admin/cli-auth`: eigene Terminal-Anmeldung – öffentlich erreichbar, unabhängig vom Admin-Login. */
export const PageCliAuth: React.FC = () => {
  const code = readCode();
  return (
    <RoutePage width={480}>
      {code ? (
        <CliAuthCard code={code} />
      ) : (
        <p className="py-20 text-center text-body text-muted-foreground">
          Kein gültiger Code. Starte `runtime connect` im Terminal erneut.
        </p>
      )}
    </RoutePage>
  );
};
