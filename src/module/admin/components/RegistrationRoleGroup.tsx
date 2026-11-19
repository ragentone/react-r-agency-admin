import { Checkbox } from '@ui/shad-cn/components/checkbox';
import React from 'react';

import type { IRegistrationRoleGroup } from '../hooks/use.registration.roles';

interface IRegistrationRoleGroupProps {
  group: IRegistrationRoleGroup;
  selected: string[];
  disabled: boolean;
  onToggle: (role: string, checked: boolean) => void;
  onToggleGroup: (checked: boolean) => void;
}

/** One app: a header checkbox for the whole app, then one row per role. */
export const RegistrationRoleGroup: React.FC<IRegistrationRoleGroupProps> = ({
  group,
  selected,
  disabled,
  onToggle,
  onToggleGroup,
}) => {
  const count = group.options.filter(option => selected.includes(option.role)).length;
  const state = count === 0 ? false : count === group.options.length ? true : 'indeterminate';

  return (
    <section className="border-b border-border/50 last:border-0">
      <label className="bg-muted/30 flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2">
        <Checkbox
          checked={state}
          disabled={disabled}
          onCheckedChange={value => onToggleGroup(value === true)}
        />
        <span className="text-sm font-semibold">{group.label}</span>
        <span className="text-muted-foreground ml-auto text-xs">
          {count}/{group.options.length}
        </span>
      </label>
      {group.options.map(option => (
        <label
          key={option.role}
          className="hover:bg-muted/50 flex min-h-11 cursor-pointer items-center gap-3 px-4 py-3 pl-10"
        >
          <Checkbox
            checked={selected.includes(option.role)}
            disabled={disabled}
            onCheckedChange={value => onToggle(option.role, value === true)}
          />
          <span className="text-sm">{option.label}</span>
          <code className="text-muted-foreground ml-auto truncate text-xs">{option.role}</code>
        </label>
      ))}
    </section>
  );
};
