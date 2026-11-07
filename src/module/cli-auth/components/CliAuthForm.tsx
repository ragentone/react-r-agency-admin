import { Alert, AlertDescription } from '@ui/shad-cn/components/alert';
import { Button } from '@ui/shad-cn/components/button';
import { Input } from '@ui/shad-cn/components/input';
import { Label } from '@ui/shad-cn/components/label';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { cn } from '@ui/lib/utils';
import React, { useState } from 'react';

import type { CliVerifyError } from '../api';
import type { CliAuthStatus } from '../hooks/use-cli-auth';

const ERRORS: Record<CliVerifyError, string> = {
  invalid: 'Anmeldung fehlgeschlagen. Benutzer, Passwort oder Admin-Rechte prüfen.',
  expired: 'Der Code ist abgelaufen. Bitte im Terminal neu starten.',
  network: 'Server nicht erreichbar.',
};

interface IProps {
  status: CliAuthStatus;
  error: CliVerifyError | null;
  onSubmit: (identifier: string, password: string) => void;
}

/** Eigene Anmeldung (E-Mail oder Alias + Passwort) nur für die Terminal-Freigabe. */
export const CliAuthForm: React.FC<IProps> = ({ status, error, onSubmit }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const pending = status === 'pending';
  const done = status === 'done';
  const ready = identifier.trim() !== '' && password !== '' && !pending && !done;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={e => {
        e.preventDefault();
        if (ready) onSubmit(identifier.trim(), password);
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="cli-auth-identifier">E-Mail oder Alias</Label>
        <Input
          id="cli-auth-identifier"
          autoComplete="username"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          disabled={pending || done}
          className={cn('h-11 border-border/50')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cli-auth-password">Passwort</Label>
        <Input
          id="cli-auth-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={pending || done}
          className={cn('h-11 border-border/50')}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{ERRORS[error]}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" className="h-11 w-full rounded-full" disabled={!ready}>
        {pending && <Spinner data-icon="inline-start" />}
        {done ? 'Terminal freigegeben' : 'Anmelden und freigeben'}
      </Button>
    </form>
  );
};
