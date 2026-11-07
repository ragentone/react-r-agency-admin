import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/shad-cn/components/card';
import { cn } from '@ui/lib/utils';
import React from 'react';

import { useCliAuth } from '../hooks/use-cli-auth';
import { CliAuthForm } from './CliAuthForm';

interface IProps {
  code: string;
}

/** Zeigt den Code aus dem Terminal und die Freigabe. */
export const CliAuthCard: React.FC<IProps> = ({ code }) => {
  const { status, error, submit } = useCliAuth(code);

  return (
    <Card className={cn('border-border/50 shadow-none')}>
      <CardHeader>
        <CardTitle className="text-title">Terminal verbinden</CardTitle>
        <CardDescription>
          Prüfe, ob dieser Code mit dem Code im Terminal übereinstimmt, und melde dich als Admin an.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="rounded-xl border border-border/50 py-4 text-center">
          <p className="text-caption text-muted-foreground">Code</p>
          <p className="font-mono text-3xl font-bold tracking-widest">{code}</p>
        </div>
        <CliAuthForm status={status} error={error} onSubmit={submit} />
      </CardContent>
    </Card>
  );
};
