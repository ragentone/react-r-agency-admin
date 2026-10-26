import { AccountSection } from '@core/account/components/AccountSection';
import { cn } from '@ui/lib/utils';
import { Check, Copy, Fingerprint } from 'lucide-react';
import { getDeviceId, getMeshClient } from 'r-agency-mesh-client-v1/release';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export interface AccountIdentifiersAccordionItemProps {
  userId: string;
  value?: string;
  className?: string;
}

/** Device id of this installation – from the mesh client, falls back to the device API. */
const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(() => {
    try {
      return getMeshClient().deviceId() ?? null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(deviceId === null);

  useEffect(() => {
    if (deviceId !== null) return;
    let alive = true;
    getDeviceId()
      .then(id => alive && setDeviceId(id || null))
      .catch(error => console.warn('[account] device id failed', error))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [deviceId]);

  return { deviceId, loading };
};

const IdRow: React.FC<{ label: string; value: string | null; loading?: boolean }> = ({
  label,
  value,
  loading,
}) => {
  const { t } = useTranslation('account');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(t('ids.copied', { defaultValue: 'Kopiert' }), { duration: 1500 });
    } catch {
      toast.error(t('ids.copyFailed', { defaultValue: 'Kopieren nicht möglich' }));
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/50 py-2 pr-1.5 pl-3">
      <div className="min-w-0 flex-1">
        <div className="text-caption leading-4 font-medium text-muted-foreground">{label}</div>
        {loading ? (
          <div className="mt-1 h-4 w-40 animate-pulse rounded-full bg-foreground/[0.07]" />
        ) : (
          <div
            className={cn(
              'mt-0.5 font-mono text-[13px] leading-5 break-all select-all',
              value ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {value ?? t('ids.unavailable', { defaultValue: 'Nicht verfügbar' })}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        disabled={!value}
        aria-label={t('ids.copyLabel', { label, defaultValue: `${label} kopieren` })}
        title={t('ids.copy', { defaultValue: 'Kopieren' })}
        className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
};

/** Read-only identifiers (user id, device id) – e.g. for support requests. */
export const AccountIdentifiersAccordionItem: React.FC<AccountIdentifiersAccordionItemProps> = ({
  userId,
  value = 'identifiers',
  className,
}) => {
  const { t } = useTranslation('account');
  const { deviceId, loading } = useDeviceId();

  return (
    <AccountSection
      value={value}
      icon={Fingerprint}
      title={t('tabs.identifiers', { defaultValue: 'Kennungen' })}
      description={t('tabs.identifiersDesc', {
        defaultValue: 'Nutzer-ID und Geräte-ID, z. B. für den Support',
      })}
      className={className}
    >
      <div className="space-y-2">
        <IdRow label={t('ids.userId', { defaultValue: 'Nutzer-ID' })} value={userId || null} />
        <IdRow
          label={t('ids.deviceId', { defaultValue: 'Geräte-ID' })}
          value={deviceId}
          loading={loading && !deviceId}
        />
        <p className="px-1 pt-1 text-caption leading-4 text-muted-foreground">
          {t('ids.hint', {
            defaultValue: 'Die Geräte-ID gilt nur für dieses Gerät bzw. diesen Browser.',
          })}
        </p>
      </div>
    </AccountSection>
  );
};
