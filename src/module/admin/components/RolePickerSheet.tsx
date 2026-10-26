import { type IUserRoleDefinition, useUserRoleRegistry } from '@core/auth/roles/role.manager.ts';
import { cn } from '@ui/lib/utils';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Checkbox } from '@ui/shad-cn/components/checkbox.tsx';
import { Input } from '@ui/shad-cn/components/input.tsx';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@ui/shad-cn/components/sheet.tsx';
import { Check, Loader2, Search, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RoleChip } from './RoleChip';

export interface IRolePickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Roles that can be picked. */
  options: IUserRoleDefinition[];
  /** `multiple` = checkboxes (add several), `single` = pick one (change a role). */
  mode?: 'multiple' | 'single';
  /** Pre-selected role (single mode, e.g. the role being changed). */
  initial?: string[];
  /** Label of the confirm button – gets `{{count}}`. */
  confirmLabel: (count: number) => string;
  /** Resolves `true` → the sheet closes. */
  onConfirm: (roles: string[]) => Promise<boolean> | boolean;
  saving?: boolean;
}

/**
 * Role picker as sheet from the right (mobile: full width): search, roles grouped by app,
 * label + description + role key, sticky confirm button. Several roles at once in `multiple`.
 */
export const RolePickerSheet: React.FC<IRolePickerSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  options,
  mode = 'multiple',
  initial = [],
  confirmLabel,
  onConfirm,
  saving = false,
}) => {
  const { t } = useTranslation('admin');
  const { groups, groupOf } = useUserRoleRegistry();
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<string[]>(initial);

  // Opened again → fresh selection + search (adjusted during render).
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setSelected(initial);
      setTerm('');
    }
  }

  const text = (value: string | undefined) => (value ? t(value, { defaultValue: value }) : '');

  const grouped = useMemo(() => {
    const needle = term.trim().toLowerCase();
    const map = new Map<string, IUserRoleDefinition[]>();
    options
      .filter(
        item =>
          !needle ||
          item.role.includes(needle) ||
          text(item.label).toLowerCase().includes(needle) ||
          text(item.description).toLowerCase().includes(needle)
      )
      .forEach(item => {
        const group = groupOf(item.role);
        map.set(group, [...(map.get(group) ?? []), item]);
      });
    return [...map.entries()];
    // `text` depends on `t` only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, term, groupOf, t]);

  const toggle = (role: string) => {
    if (saving) return;
    if (mode === 'single') {
      setSelected([role]);
      return;
    }
    setSelected(current =>
      current.includes(role) ? current.filter(item => item !== role) : [...current, role]
    );
  };

  /** Roles picked that are still offered (single mode: unchanged pick = nothing to do). */
  const picked = selected.filter(
    role =>
      options.some(item => item.role === role) && !(mode === 'single' && initial.includes(role))
  );

  const confirm = async () => {
    if (!picked.length || saving) return;
    if (await onConfirm(picked)) onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={next => !saving && onOpenChange(next)}>
      <SheetContent
        side="right"
        className="z-[60] flex w-full flex-col gap-0 p-0 sm:max-w-md"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <header className="flex items-start gap-2 border-b border-border/60 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-title font-extrabold">{title}</SheetTitle>
            <SheetDescription className={cn('mt-0.5 text-caption', !description && 'sr-only')}>
              {description ?? title}
            </SheetDescription>
          </div>
          <Button
            variant="ghost"
            size="icon-lg"
            pill
            onClick={() => onOpenChange(false)}
            disabled={saving}
            aria-label={t('rolePicker.close')}
            className="-mr-2 shrink-0"
          >
            <X />
          </Button>
        </header>

        <div className="border-b border-border/60 px-4 py-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={term}
              onChange={event => setTerm(event.target.value)}
              placeholder={t('rolePicker.search')}
              aria-label={t('rolePicker.search')}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="h-11 rounded-full pl-10 text-base sm:text-body"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {grouped.length === 0 ? (
            <p className="px-4 py-10 text-center text-body text-muted-foreground">
              {options.length ? t('rolePicker.noMatch') : t('role.allAssigned')}
            </p>
          ) : (
            grouped.map(([group, items]) => (
              <section key={group} aria-labelledby={`role-group-${group}`}>
                <h3
                  id={`role-group-${group}`}
                  className="sticky top-0 z-10 bg-background/95 px-4 pt-4 pb-1.5 text-caption font-semibold tracking-wide text-muted-foreground uppercase backdrop-blur"
                >
                  {text(groups[group]?.label) || group}
                </h3>
                <ul
                  role={mode === 'single' ? 'radiogroup' : 'group'}
                  aria-label={text(groups[group]?.label) || group}
                >
                  {items.map(item => {
                    const active = selected.includes(item.role);
                    const id = `role-pick-${item.role.replace(/[^a-z0-9]/gi, '-')}`;
                    const detail = text(item.description);
                    return (
                      <li key={item.role}>
                        <label
                          htmlFor={id}
                          className={cn(
                            'flex min-h-16 cursor-pointer items-start gap-3 px-4 py-3 transition-colors active:bg-foreground/[0.06]',
                            active ? 'bg-foreground/[0.04]' : 'hover:bg-foreground/[0.03]'
                          )}
                        >
                          {mode === 'multiple' ? (
                            <Checkbox
                              id={id}
                              checked={active}
                              onCheckedChange={() => toggle(item.role)}
                              disabled={saving}
                              className="mt-0.5 size-5 shrink-0"
                            />
                          ) : (
                            <button
                              id={id}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => toggle(item.role)}
                              disabled={saving}
                              className={cn(
                                'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                                active
                                  ? 'border-foreground bg-foreground text-background'
                                  : 'border-foreground/40'
                              )}
                            >
                              {active && <Check className="size-3" aria-hidden="true" />}
                            </button>
                          )}
                          <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                            <span className="text-body leading-5 font-semibold">
                              {text(item.label) || item.role}
                            </span>
                            {detail && (
                              <span className="text-caption leading-4 text-muted-foreground">
                                {detail}
                              </span>
                            )}
                            <RoleChip role={item.role} size="sm" />
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-border/60 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
          {mode === 'multiple' && picked.length > 0 && (
            <Button
              variant="ghost"
              pill
              size="lg"
              onClick={() => setSelected([])}
              disabled={saving}
              className="shrink-0"
            >
              {t('rolePicker.clear')}
            </Button>
          )}
          <Button
            pill
            size="xl"
            onClick={() => void confirm()}
            disabled={saving || picked.length === 0}
            className="flex-1"
          >
            {saving && <Loader2 className="animate-spin" aria-hidden="true" />}
            {confirmLabel(picked.length)}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
};
