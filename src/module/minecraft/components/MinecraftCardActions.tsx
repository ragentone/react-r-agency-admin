import { Button } from '@ui/shad-cn/components/button.tsx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { Play, RotateCcw, Square } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IMinecraftRunState } from '../types';

export type CardAction = 'start' | 'stop' | 'restart';

/** Start/Neustart/Stopp einer Server-Karte als Icon-Buttons. */
export const MinecraftCardActions: React.FC<{
  state: IMinecraftRunState | undefined;
  busy: CardAction | null;
  onRun: (action: CardAction) => void;
}> = ({ state, busy, onRun }) => {
  const { t } = useTranslation('minecraft');
  const canStart = state === 'stopped' || state === 'crashed';
  const canStop = state === 'running' || state === 'starting';
  const button = (
    action: CardAction,
    variant: 'default' | 'outline' | 'destructive',
    icon: React.ReactNode,
    enabled: boolean,
    loading: boolean
  ) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon-lg"
          aria-label={t(`action.${action}`)}
          disabled={!enabled || busy !== null}
          isLoading={loading}
          onClick={() => onRun(action)}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t(`action.${action}`)}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex gap-2">
      {button(
        'start',
        'default',
        <Play />,
        canStart,
        busy === 'start' || state === 'starting' || state === 'stopping'
      )}
      {button('restart', 'outline', <RotateCcw />, canStop, busy === 'restart')}
      {button('stop', 'destructive', <Square />, canStop, busy === 'stop')}
    </div>
  );
};
