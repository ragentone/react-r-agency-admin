import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import {
  Download,
  Fingerprint,
  KeyRound,
  Lock,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AuthApi } from '../api';
import { useErrorText } from '../hooks/use.error.text';
import { type SecurityDrawerName, useSecurityStore } from '../store';
import { withSudo } from '../sudo';
import type { IAuthSecurity } from '../types';
import { downloadJson } from '../utils/format';
import { DeleteDrawer } from './DeleteDrawer';
import { EmailDrawer } from './EmailDrawer';
import { InviteDrawer } from './InviteDrawer';
import { PasskeysDrawer } from './PasskeysDrawer';
import { PasswordDrawer } from './PasswordDrawer';
import { SessionsDrawer } from './SessionsDrawer';
import { TotpDrawer } from './TotpDrawer';
import { SecurityRow } from './ui';

/** Group heading like the other account groups (X style). */
const GroupLabel: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2
    id={id}
    className="px-4 pt-4 pb-1 text-title leading-6 font-extrabold tracking-tight text-foreground"
  >
    {children}
  </h2>
);

/**
 * Account → "Security": devices, passkeys, two-factor, e-mail, password, invite link, data export.
 * Each row opens its own drawer. `?drawer=sessions` (push "new sign-in") opens it directly.
 */
export const SecuritySection: React.FC<{ onEmailChanged?: () => void }> = ({ onEmailChanged }) => {
  const { t } = useTranslation('security');
  const errorText = useErrorText();
  const drawer = useSecurityStore(state => state.drawer);
  const openDrawer = useSecurityStore(state => state.openDrawer);
  const [security, setSecurity] = useState<IAuthSecurity | null>(null);
  const [failed, setFailed] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    const result = await AuthApi.security();
    if (result.success && result.security) {
      setSecurity(result.security);
      setFailed(false);
    } else {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void AuthApi.security().then(result => {
      if (!active) return;
      if (result.success && result.security) {
        setSecurity(result.security);
        setFailed(false);
      } else {
        setFailed(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const drawerProps = (name: SecurityDrawerName) => ({
    open: drawer === name,
    onOpenChange: (open: boolean) => openDrawer(open ? name : null),
  });

  const exportData = async () => {
    setExporting(true);
    const result = await withSudo(() => AuthApi.exportData());
    setExporting(false);
    if (result.error === 'sudo_required') return;
    if (!result.success) {
      toast.error(errorText(result));
      return;
    }
    downloadJson(result.data, `account-export-${new Date().toISOString().slice(0, 10)}.json`);
    toast.success(t('data.exported'));
  };

  const isDefault = security?.userType === 'default';

  return (
    <section aria-labelledby="account-group-security">
      <GroupLabel id="account-group-security">{t('section.title')}</GroupLabel>

      {!security && !failed && (
        <div className="flex flex-col gap-3 px-4 py-3">
          {[0, 1, 2, 3].map(index => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      )}
      {failed && <p className="px-4 py-3 text-body text-muted-foreground">{t('errors.unknown')}</p>}

      {security && (
        <>
          <SecurityRow
            icon={MonitorSmartphone}
            title={t('section.sessions')}
            description={t('section.sessionsDesc')}
            value={security.sessions}
            onClick={() => openDrawer('sessions')}
          />
          <SecurityRow
            icon={Fingerprint}
            title={t('section.passkeys')}
            description={t('section.passkeysDesc')}
            value={security.passkeys.length || t('section.none')}
            onClick={() => openDrawer('passkeys')}
          />
          <SecurityRow
            icon={ShieldCheck}
            title={t('section.totp')}
            description={t('section.totpDesc')}
            value={security.totpEnabled ? t('section.on') : t('section.off')}
            onClick={() => openDrawer('totp')}
          />
          {isDefault && (
            <SecurityRow
              icon={Mail}
              title={t('section.email')}
              description={security.email}
              onClick={() => openDrawer('email')}
            />
          )}
          {isDefault && !security.hasPassword && (
            <SecurityRow
              icon={Lock}
              title={t('section.passwordSet')}
              description={t('section.passwordSetDesc')}
              onClick={() => openDrawer('password')}
            />
          )}
          {isDefault && security.hasPassword && (
            <SecurityRow
              icon={KeyRound}
              title={t('section.passwordReset')}
              description={t('section.passwordResetDesc')}
              onClick={() => openDrawer('password')}
            />
          )}
          <SecurityRow
            icon={UserPlus}
            title={t('section.invite')}
            description={t('section.inviteDesc')}
            onClick={() => openDrawer('invite')}
          />
          <SecurityRow
            icon={Download}
            title={t('data.export')}
            description={exporting ? t('data.exporting') : t('data.exportDesc')}
            onClick={() => void exportData()}
          />
        </>
      )}

      <SessionsDrawer {...drawerProps('sessions')} onChanged={load} />
      <PasskeysDrawer {...drawerProps('passkeys')} onChanged={load} />
      <TotpDrawer {...drawerProps('totp')} security={security} onChanged={load} />
      <EmailDrawer
        {...drawerProps('email')}
        current={security?.email ?? null}
        onChanged={() => {
          void load();
          onEmailChanged?.();
        }}
      />
      <PasswordDrawer
        {...drawerProps('password')}
        hasPassword={Boolean(security?.hasPassword)}
        onChanged={load}
      />
      <InviteDrawer {...drawerProps('invite')} />
      <DeleteDrawer {...drawerProps('delete')} />
    </section>
  );
};
