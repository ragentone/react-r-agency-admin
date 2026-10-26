import { AccountSection } from '@core/account/components/AccountSection';
import { useUserRoleRegistry } from '@core/auth/roles/role.manager.ts';
import { useRoles } from '@core/auth/roles/use.roles.ts';
import { BadgeCheck, Info, ShieldUser } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountRolesAccordionItemProps {
  value?: string;
  className?: string;
}

interface IRoleRow {
  role: string;
  label: string | null;
  description: string | null;
}

/** `admin:user` as two-tone mono text (`admin` bold, `:user` muted). */
const RoleKey: React.FC<{ role: string }> = ({ role }) => {
  const index = role.indexOf(':');
  const scope = index < 0 ? role : role.slice(0, index);
  const rest = index < 0 ? '' : role.slice(index);
  return (
    <span className="truncate font-mono text-[11px] leading-4">
      <span className="font-semibold text-foreground/80">{scope}</span>
      {rest && <span className="text-muted-foreground">{rest}</span>}
    </span>
  );
};

/**
 * Roles of the logged-in user – read only (granting / taking happens in the admin area).
 * Grouped like the admin role select (`Core.roles` groups); roles no app registered
 * show their raw key.
 */
export const AccountRolesAccordionItem: React.FC<AccountRolesAccordionItemProps> = ({
  value = 'roles',
  className,
}) => {
  const { t } = useTranslation(['account', 'auth']);
  const { roles, superUser } = useRoles();
  const { get, groups, groupOf } = useUserRoleRegistry();

  const grouped = useMemo(() => {
    const text = (key?: string) => (key ? t(key, { defaultValue: key }) : null);
    const order = (group: string) => groups[group]?.sortOrder ?? 100;
    const byGroup = new Map<string, IRoleRow[]>();
    [...roles]
      .sort(
        (a, b) =>
          order(groupOf(a)) - order(groupOf(b)) ||
          (get(a)?.sortOrder ?? 0) - (get(b)?.sortOrder ?? 0) ||
          a.localeCompare(b)
      )
      .forEach(role => {
        const group = groupOf(role);
        const definition = get(role);
        const rows = byGroup.get(group) ?? [];
        rows.push({
          role,
          label: text(definition?.label),
          description: text(definition?.description),
        });
        byGroup.set(group, rows);
      });
    return [...byGroup.entries()].map(([group, rows]) => ({
      group,
      label: t(groups[group]?.label ?? group, { defaultValue: group }),
      rows,
    }));
  }, [roles, get, groups, groupOf, t]);

  return (
    <AccountSection
      value={value}
      icon={ShieldUser}
      title={t('tabs.roles', { defaultValue: 'Meine Rollen' })}
      description={t('tabs.rolesDesc', {
        defaultValue: 'Rollen und Berechtigungen deines Kontos',
      })}
      className={className}
    >
      <div className="space-y-4">
        {superUser && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-caption leading-4 font-semibold text-primary">
            <BadgeCheck className="size-4 shrink-0" aria-hidden="true" />
            {t('roles.superUser', { defaultValue: 'Superuser – Zugriff auf alle Bereiche' })}
          </div>
        )}

        {grouped.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 px-3 py-4 text-center text-body text-muted-foreground">
            {t('roles.empty', { defaultValue: 'Deinem Konto sind keine Rollen zugewiesen.' })}
          </p>
        ) : (
          grouped.map(({ group, label, rows }) => (
            <section key={group} aria-label={label}>
              {grouped.length > 1 && (
                <h4 className="px-1 pb-1.5 text-micro font-semibold tracking-wider text-muted-foreground uppercase">
                  {label}
                </h4>
              )}
              <ul className="space-y-2">
                {rows.map(row => (
                  <li
                    key={row.role}
                    className="flex items-start gap-3 rounded-xl border border-border/50 px-3 py-2.5"
                  >
                    <BadgeCheck
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-body leading-5 font-semibold text-foreground">
                        {row.label ?? row.role}
                      </span>
                      {row.description && (
                        <span className="text-caption leading-4 text-muted-foreground">
                          {row.description}
                        </span>
                      )}
                      {row.label && <RoleKey role={row.role} />}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <p className="flex items-start gap-1.5 px-1 text-caption leading-4 text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {t('roles.hint', {
            defaultValue:
              'Rollen werden von Administratoren vergeben und können hier nicht geändert werden.',
          })}
        </p>
      </div>
    </AccountSection>
  );
};
