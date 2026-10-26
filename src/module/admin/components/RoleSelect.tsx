import { type IUserRoleDefinition, useUserRoleRegistry } from '@core/auth/roles/role.manager.ts';
import { cn } from '@ui/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface IRoleSelectProps {
  value: string;
  onValueChange: (role: string) => void;
  /** Roles that can be picked (already filtered by the caller). */
  options: IUserRoleDefinition[];
  placeholder: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

/** shadcn select of registered roles (`Core.roles`), grouped by app – label + role key. */
export const RoleSelect: React.FC<IRoleSelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  disabled,
  className,
}) => {
  const { t } = useTranslation();
  const { groups, groupOf } = useUserRoleRegistry();
  // Inside a drawer the list is portaled into the drawer popup – outside of it the drawer's
  // focus trap / outside-press would close the select (or the drawer) right away.
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const anchor = useCallback((node: HTMLSpanElement | null) => {
    setContainer(node?.closest<HTMLElement>('[data-slot="drawer-content"]') ?? null);
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, IUserRoleDefinition[]>();
    options.forEach(option => {
      const group = groupOf(option.role);
      map.set(group, [...(map.get(group) ?? []), option]);
    });
    return [...map.entries()];
  }, [options, groupOf]);

  return (
    <>
      <span ref={anchor} hidden />
      <Select value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          aria-label={ariaLabel}
          className={cn(
            'h-auto min-h-11 w-full min-w-0 rounded-xl py-1.5 text-left text-base sm:text-body [&>span]:line-clamp-none',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {/* z above the bottom drawer (z-50); popper keeps it next to the trigger on mobile. */}
        <SelectContent
          position="popper"
          container={container}
          className="z-[60] max-h-[min(60dvh,22rem)] rounded-xl"
        >
          {grouped.map(([group, items], index) => (
            <Fragment key={group}>
              {index > 0 && <SelectSeparator />}
              <SelectGroup>
                <SelectLabel className="text-[11px] tracking-wide text-muted-foreground uppercase">
                  {t(groups[group]?.label ?? group, { defaultValue: group })}
                </SelectLabel>
                {items.map(item => (
                  <SelectItem
                    key={item.role}
                    value={item.role}
                    className="min-h-11 rounded-lg py-2"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold">
                        {t(item.label, { defaultValue: item.label })}
                      </span>
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {item.role}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </Fragment>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};
