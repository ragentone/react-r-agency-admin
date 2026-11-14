import { Terminal } from 'lucide-react';
import React from 'react';

import { useCliAuth } from '../hooks/use-cli-auth';
import { CliAuthCode } from './CliAuthCode';
import { CliAuthForm } from './CliAuthForm';
import { CliAuthSuccess } from './CliAuthSuccess';

interface IProps {
  code: string;
}

/** Zeigt den Code aus dem Terminal und die Freigabe – ohne Kartenrahmen, mobil randlos. */
export const CliAuthCard: React.FC<IProps> = ({ code }) => {
  const { status, error, submit } = useCliAuth(code);
  const done = status === 'done';

  return (
    <div className="flex flex-col gap-6">
      {!done && (
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-foreground text-background">
            <Terminal className="size-5" aria-hidden="true" />
          </span>
          <h1 className="text-title font-bold">Terminal verbinden</h1>
          <p className="text-body text-muted-foreground">
            Vergleiche den Code mit dem im Terminal und melde dich als Admin an.
          </p>
        </header>
      )}
      <CliAuthCode code={code} />
      {done ? <CliAuthSuccess /> : <CliAuthForm status={status} error={error} onSubmit={submit} />}
    </div>
  );
};
