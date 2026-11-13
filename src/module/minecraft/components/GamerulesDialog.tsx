import { AppDialog } from '@ui/components';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Label } from '@ui/shad-cn/components/label.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import { Switch } from '@ui/shad-cn/components/switch.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useGamerules } from '../hooks/use-gamerules';
import { MINECRAFT_GAMERULES } from '../types';

/** Spielregeln des laufenden Servers; jede Änderung gilt sofort und bleibt in der Welt gespeichert. */
export const GamerulesDialog: React.FC<{
  serverId: string;
  name: string;
  onClose: () => void;
}> = ({ serverId, name, onClose }) => {
  const { t } = useTranslation('minecraft');
  const { rules, error, pending, toggle } = useGamerules(serverId);

  return (
    <AppDialog
      open
      onOpenChange={open => !open && onClose()}
      title={t('gamerule.title', { name })}
      description={t('gamerule.text')}
      size="sm"
      bodyClassName="flex flex-col gap-1 p-4"
      footer={
        <Button variant="outline" onClick={onClose}>
          {t('bds.close')}
        </Button>
      }
    >
      {!rules && !error && <Skeleton className="h-48 w-full" aria-label={t('gamerule.loading')} />}
      {error && (
        <p role="alert" className="text-caption text-destructive">
          {t(`action.error.${error}`, { defaultValue: t('action.error.unknown') })}
        </p>
      )}
      {rules &&
        MINECRAFT_GAMERULES.map(rule => {
          const value = rules[rule];
          return (
            <div
              key={rule}
              className="flex items-center justify-between gap-3 border-b border-border/50 py-2 last:border-b-0"
            >
              <Label htmlFor={`mc-rule-${rule}`} className="flex flex-col items-start gap-0.5">
                <span>{t(`gamerule.rule.${rule}`)}</span>
                {value === null && (
                  <span className="text-caption font-normal text-muted-foreground">
                    {t('gamerule.unknown')}
                  </span>
                )}
              </Label>
              <Switch
                id={`mc-rule-${rule}`}
                checked={value === true}
                disabled={pending !== null}
                onCheckedChange={checked => void toggle(rule, checked)}
              />
            </div>
          );
        })}
    </AppDialog>
  );
};
