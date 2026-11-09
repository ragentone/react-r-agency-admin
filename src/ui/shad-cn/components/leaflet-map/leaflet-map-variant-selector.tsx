import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/shad-cn/components/dropdown-menu';
import {
  Compass,
  Globe,
  Layers,
  Map as MapIcon,
  Moon,
  Mountain,
  Navigation,
  Sun,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LeafletMapVariant } from './leaflet-map.variants.ts';

export interface LeafletMapVariantOption {
  id: LeafletMapVariant;
  fallbackLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DEFAULT_LEAFLET_VARIANTS: LeafletMapVariantOption[] = [
  { id: 'satellite-streets', fallbackLabel: 'Satellit (mit Straßen)', icon: Layers },
  { id: 'satellite', fallbackLabel: 'Satellit', icon: Globe },
  { id: 'streets', fallbackLabel: 'Straßenkarte', icon: MapIcon },
  { id: 'outdoors', fallbackLabel: 'Gelände / Topo', icon: Mountain },
  { id: 'light', fallbackLabel: 'Hell', icon: Sun },
  { id: 'dark', fallbackLabel: 'Dunkel', icon: Moon },
  { id: 'navigation-day', fallbackLabel: 'Navigation (Tag)', icon: Navigation },
  { id: 'navigation-night', fallbackLabel: 'Navigation (Nacht)', icon: Navigation },
  { id: 'default', fallbackLabel: 'Automatisch (Theme)', icon: Compass },
];

const POSITION_CLASSES = {
  'top-left': 'absolute top-3 left-3 z-[1000]',
  'top-right': 'absolute top-3 right-3 z-[1000]',
  'bottom-left': 'absolute bottom-3 left-3 z-[1000]',
  'bottom-right': 'absolute bottom-3 right-3 z-[1000]',
  none: '',
} as const;

export interface LeafletMapVariantSelectorProps {
  value?: LeafletMapVariant;
  defaultValue?: LeafletMapVariant;
  onValueChange?: (variant: LeafletMapVariant) => void;
  variants?: (LeafletMapVariant | LeafletMapVariantOption)[];
  position?: keyof typeof POSITION_CLASSES;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  title?: string;
  ariaLabel?: string;
}

export const LeafletMapVariantSelector = ({
  value: controlledValue,
  defaultValue = 'satellite-streets',
  onValueChange,
  variants = DEFAULT_LEAFLET_VARIANTS,
  position = 'none',
  align = 'end',
  side = 'bottom',
  className,
  triggerClassName,
  contentClassName,
  title,
  ariaLabel,
}: LeafletMapVariantSelectorProps) => {
  const { t } = useTranslation('geo');
  const [uncontrolledValue, setUncontrolledValue] = useState<LeafletMapVariant>(defaultValue);

  const activeValue = controlledValue ?? uncontrolledValue;

  const normalizedVariants = useMemo<LeafletMapVariantOption[]>(() => {
    return variants.map(v => {
      if (typeof v === 'string') {
        const found = DEFAULT_LEAFLET_VARIANTS.find(item => item.id === v);
        return (
          found ?? {
            id: v,
            fallbackLabel: v,
            icon: Layers,
          }
        );
      }
      return v;
    });
  }, [variants]);

  const handleSelect = (nextVariant: string) => {
    const variant = nextVariant as LeafletMapVariant;
    if (controlledValue === undefined) {
      setUncontrolledValue(variant);
    }
    onValueChange?.(variant);
  };

  const currentLabel = ariaLabel ?? t('variantSelector.ariaLabel', 'Kartenansicht wählen');
  const headerTitle = title ?? t('variantSelector.title', 'Kartenansicht');

  return (
    <div className={cn(POSITION_CLASSES[position], className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="icon-md"
            pill={false}
            className={cn(
              'size-9 rounded-lg border border-border bg-card/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted',
              triggerClassName
            )}
            aria-label={currentLabel}
            title={currentLabel}
          >
            <Layers className="size-4.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          side={side}
          className={cn('z-[1000] min-w-52 max-w-72', contentClassName)}
        >
          <DropdownMenuLabel>{headerTitle}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={activeValue} onValueChange={handleSelect}>
            {normalizedVariants.map(option => {
              const Icon = option.icon;
              return (
                <DropdownMenuRadioItem
                  key={option.id}
                  value={option.id}
                  className="flex items-center gap-2.5 py-2 cursor-pointer"
                >
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {t(`variantSelector.variants.${option.id}`, option.fallbackLabel)}
                  </span>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
