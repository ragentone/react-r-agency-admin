import { type IUserRoleDefinition, useUserRoleRegistry } from '@core/auth/roles/role.manager.ts';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@ui/shad-cn/components/alert-dialog.tsx';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Loader2, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useBackendRoles } from '../hooks/use.backend.roles';
import type { AdminRoleUpdate, IAdminRoleResult, IAdminUser } from '../types';
import { RoleChip } from './RoleChip';
import { RolePickerSheet } from './RolePickerSheet';

export interface IAdminRoleEditorProps {
  user: IAdminUser;
  saving: boolean;
  onUpdate: (user: IAdminUser, change: AdminRoleUpdate) => Promise<IAdminRoleResult>;
  /** Called with the updated user after a successful change. */
  onChanged: (user: IAdminUser) => void;
}

/**
 * Roles of one user: add (several at once), change, remove – picked in a sheet from the right
 * (`RolePickerSheet`) from the registered roles (`Core.roles`, loaded from the runtime).
 * Protected roles (`user.protectedRoles`) show a lock and no actions – the backend enforces it too.
 * Roles the user has but no app registered stay visible ("not registered") and can be removed.
 */
export const AdminRoleEditor: React.FC<IAdminRoleEditorProps> = ({
  user,
  saving,
  onUpdate,
  onChanged,
}) => {
  const { t } = useTranslation('admin');
  const { assignable, get } = useUserRoleRegistry();
  // Every role of the runtime (also of apps that only live in the app frontend).
  const { loading: rolesLoading, error: rolesError } = useBackendRoles();
  const [adding, setAdding] = useState(false);
  /** Role whose "change" sheet is open. */
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  // Another user opened → reset (adjusted during render).
  const [userId, setUserId] = useState(user.id);
  if (userId !== user.id) {
    setUserId(user.id);
    setAdding(false);
    setEditing(null);
    setConfirmRemove(null);
  }

  const readOnly = user.locked;
  const isProtected = (role: string) => user.protectedRoles.includes(role);
  /** Registered + not `assignable: false` – unknown roles may still be removed / changed. */
  const isManaged = (role: string) => get(role)?.assignable !== false;

  /** Roles that can still be granted. */
  const available = useMemo(
    () => assignable.filter(item => !user.roles.includes(item.role)),
    [assignable, user.roles]
  );

  /** Options for changing `role`: itself + every role still available. */
  const changeOptions = (role: string): IUserRoleDefinition[] => {
    const current = get(role) ?? { role, label: role, group: 'other' };
    return [current, ...available];
  };
  const changeOptionsOf = editing ? changeOptions(editing) : [];

  const label = (role: string) => {
    const definition = get(role);
    return definition ? t(definition.label, { defaultValue: definition.label }) : null;
  };

  const run = async (change: AdminRoleUpdate, success: string) => {
    const result = await onUpdate(user, change);
    const roles =
      change.action === 'add'
        ? change.roles
        : [change.action === 'change' ? change.to : change.role];
    if (result.ok && result.user) {
      onChanged(result.user);
      toast.success(
        t(success, {
          role: roles.map(role => label(role) ?? role).join(', '),
          count: roles.length,
        })
      );
    } else {
      toast.error(t(result.error ?? 'error.save'));
    }
    return result.ok;
  };

  const add = (roles: string[]) => run({ action: 'add', roles }, 'toast.addedMany');

  const change = async ([to]: string[]) => {
    if (!editing || !to || to === editing) return true;
    return run({ action: 'change', role: editing, to }, 'toast.changed');
  };

  const remove = async () => {
    if (!confirmRemove || saving) return;
    if (await run({ action: 'remove', role: confirmRemove }, 'toast.removed')) {
      setConfirmRemove(null);
    }
  };

  return (
    <div className="space-y-6">
      {readOnly && (
        <p className="flex items-start gap-2 rounded-2xl bg-foreground/[0.05] p-3 text-caption text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t('role.superUserLocked')}
        </p>
      )}

      <section aria-labelledby={`roles-${user.id}`}>
        <h3
          id={`roles-${user.id}`}
          className="mb-2 text-caption font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {t('role.title', { count: user.roles.length })}
        </h3>

        {user.roles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-caption text-muted-foreground">
            {t('role.empty')}
          </p>
        ) : (
          <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border/60">
            {user.roles.map(role => {
              const locked = isProtected(role);
              const canEdit = !readOnly && !locked && isManaged(role);

              const name = label(role);
              return (
                <li key={role} className="flex min-h-16 items-center gap-2 py-2 pr-1.5 pl-3">
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                    <span className="flex max-w-full items-center gap-1.5">
                      {locked && (
                        <Lock
                          className="size-3.5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate text-body font-semibold">{name ?? role}</span>
                    </span>
                    <RoleChip role={role} size="sm" />
                    {locked ? (
                      <span className="text-[11px] text-muted-foreground">
                        {user.self ? t('role.protectedSelf') : t('role.protected')}
                      </span>
                    ) : !name ? (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400">
                        {t('role.unregistered')}
                      </span>
                    ) : !isManaged(role) ? (
                      <span className="text-[11px] text-muted-foreground">{t('role.system')}</span>
                    ) : null}
                  </div>
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing(role)}
                        disabled={saving}
                        aria-label={t('role.changeLabel', { role })}
                        className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-40"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemove(role)}
                        disabled={saving}
                        aria-label={t('role.removeLabel', { role })}
                        className="grid size-11 shrink-0 place-items-center rounded-full text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-40"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!readOnly && (
        <section aria-labelledby={`role-add-${user.id}`}>
          <h3
            id={`role-add-${user.id}`}
            className="mb-2 text-caption font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {t('role.add')}
          </h3>
          {rolesError && (
            <p role="alert" className="mb-2 px-1 text-caption text-muted-foreground">
              {t('role.loadError')}
            </p>
          )}
          {rolesLoading && available.length === 0 ? (
            <div className="flex h-11 items-center justify-center rounded-full border border-border text-caption text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              {t('role.loading')}
            </div>
          ) : available.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-center text-caption text-muted-foreground">
              {t('role.allAssigned')}
            </p>
          ) : (
            <Button
              variant="outline"
              pill
              size="lg"
              fullWidth
              onClick={() => setAdding(true)}
              disabled={saving}
              aria-haspopup="dialog"
            >
              <Plus />
              {t('role.addOpen', { count: available.length })}
            </Button>
          )}
        </section>
      )}

      <RolePickerSheet
        open={adding}
        onOpenChange={setAdding}
        title={t('rolePicker.addTitle')}
        description={t('rolePicker.addDescription', { user: user.alias })}
        options={available}
        mode="multiple"
        confirmLabel={count =>
          count ? t('rolePicker.addConfirm', { count }) : t('rolePicker.addNone')
        }
        onConfirm={add}
        saving={saving}
      />

      <RolePickerSheet
        open={editing !== null}
        onOpenChange={next => !next && setEditing(null)}
        title={t('rolePicker.changeTitle')}
        description={
          editing
            ? t('rolePicker.changeDescription', { role: label(editing) ?? editing })
            : undefined
        }
        options={changeOptionsOf}
        mode="single"
        initial={editing ? [editing] : []}
        confirmLabel={() => t('rolePicker.changeConfirm')}
        onConfirm={change}
        saving={saving}
      />

      <AlertDialog
        open={confirmRemove !== null}
        onOpenChange={next => !saving && !next && setConfirmRemove(null)}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-[340px] gap-6 rounded-2xl p-8">
          <AlertDialogHeader className="space-y-2 text-left">
            <AlertDialogTitle className="text-xl font-bold tracking-tight">
              {t('remove.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body leading-5">
              {user.self
                ? t('remove.descriptionSelf', { role: confirmRemove })
                : t('remove.description', { role: confirmRemove, user: user.alias })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3 sm:flex-col sm:space-x-0">
            <button
              type="button"
              disabled={saving}
              onClick={() => void remove()}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-destructive text-body font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {t('remove.confirm')}
            </button>
            <AlertDialogCancel
              disabled={saving}
              className="mt-0 h-11 w-full rounded-full text-body font-bold sm:mt-0"
            >
              {t('role.cancel')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
