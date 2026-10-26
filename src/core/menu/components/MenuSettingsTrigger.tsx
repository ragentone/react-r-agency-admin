import { cn } from '@ui/lib';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/shad-cn/components/tooltip.tsx';
import { SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMenu } from '../hooks';
import type { IMenuComponentEntry } from '../types.ts';
import { MenuSettingsDrawer } from './MenuSettingsDrawer.tsx';

/** `dock` = mobile dock, `rail` = icon rail (md–xl), `sidebar` = expanded sidebar (xl). */
type MenuSettingsTriggerVariant = 'dock' | 'rail' | 'sidebar';

/** Calls one `useAttention` hook (own component → stable hook order) and reports the result. */
const AttentionProbe = ({
  id,
  useAttention,
  onChange,
}: {
  id: string;
  useAttention: NonNullable<IMenuComponentEntry['useAttention']>;
  onChange: (id: string, active: boolean) => void;
}) => {
  const active = Boolean(useAttention());
  useEffect(() => {
    onChange(id, active);
    return () => onChange(id, false);
  }, [id, active, onChange]);
  return null;
};

/** Blinking red dot (static with reduced motion). */
const AttentionDot = ({ className }: { className?: string }) => (
  <span aria-hidden className={cn('pointer-events-none absolute flex size-2.5', className)}>
    <span
      className={
        'absolute inline-flex size-full animate-ping rounded-full bg-[#f4212e] opacity-75 motion-reduce:animate-none'
      }
    />
    <span
      className={'relative inline-flex size-2.5 rounded-full bg-[#f4212e] ring-2 ring-background'}
    />
  </span>
);

interface IProps {
  variant: MenuSettingsTriggerVariant;
  className?: string;
}

/**
 * Opens the settings drawer (right side). Renders nothing when no component is registered
 * with `placement: 'settings'`.
 */
const MenuSettingsTrigger = ({ variant, className }: IProps) => {
  const { t } = useTranslation('menu');
  const { settings } = useMenu();
  const [open, setOpen] = useState(false);
  const [attention, setAttention] = useState<Record<string, boolean>>({});
  const onAttention = useCallback((id: string, active: boolean) => {
    setAttention(prev => (Boolean(prev[id]) === active ? prev : { ...prev, [id]: active }));
  }, []);

  if (settings.length === 0) return null;

  const probes = settings.filter(entry => entry.useAttention);
  const hasAttention = probes.some(entry => attention[entry.id]);
  const label = t('settings.quick');
  const ariaLabel = hasAttention ? `${label} – ${t('settings.attention')}` : label;

  const button = (
    <button
      type={'button'}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-haspopup={'dialog'}
      onClick={() => setOpen(true)}
      className={cn(
        'group relative flex shrink-0 items-center outline-none transition-[background-color,color,transform] focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]',
        variant === 'dock' &&
          'size-11 justify-center rounded-full text-foreground hover:bg-foreground/[0.06] active:scale-95',
        variant !== 'dock' &&
          'w-full rounded-full text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground',
        variant === 'rail' && 'justify-center p-3',
        variant === 'sidebar' && 'gap-3 px-4 py-2',
        className
      )}
    >
      <SlidersHorizontal
        className={cn(
          'shrink-0',
          variant === 'dock' && 'size-[22px]',
          variant === 'rail' && 'size-6',
          variant === 'sidebar' && 'size-5'
        )}
        strokeWidth={variant === 'dock' ? 2 : 1.75}
      />
      {variant === 'sidebar' && <span className={'truncate text-body font-medium'}>{label}</span>}
      {hasAttention && (
        <AttentionDot
          className={cn(
            variant === 'dock' && 'top-1.5 right-1.5',
            variant === 'rail' && 'top-2 right-2',
            variant === 'sidebar' && 'top-1.5 left-8'
          )}
        />
      )}
    </button>
  );

  return (
    <>
      {probes.map(entry => (
        <AttentionProbe
          key={entry.id}
          id={entry.id}
          useAttention={entry.useAttention!}
          onChange={onAttention}
        />
      ))}
      {variant === 'rail' ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side={'right'} sideOffset={6}>
            {label}
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
      <MenuSettingsDrawer open={open} onOpenChange={setOpen} />
    </>
  );
};

/** Settings trigger inside the mobile dock (right side) – registered in `core.tsx`. */
const MenuSettingsDockButton = () => <MenuSettingsTrigger variant={'dock'} />;

export { MenuSettingsDockButton, MenuSettingsTrigger };
