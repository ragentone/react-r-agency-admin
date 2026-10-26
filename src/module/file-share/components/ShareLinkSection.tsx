import { Check, Copy, Link2, Link2Off, Loader2, RefreshCw, Share2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { fileShareLinkUrl } from '../const';
import type { IFileShareItem, IFileShareWriteResult } from '../types';
import { copyText } from '../utils';

export interface IShareLinkSectionProps {
  item: IFileShareItem;
  saving: boolean;
  onCreate: (id: string) => Promise<IFileShareWriteResult>;
  onRevoke: (id: string) => Promise<IFileShareWriteResult>;
}

type Confirm = 'renew' | 'revoke' | null;

const iconButton =
  'grid size-11 shrink-0 place-items-center rounded-full border border-border/60 transition-colors hover:bg-foreground/[0.06] disabled:opacity-50';
const textButton =
  'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors hover:bg-foreground/[0.06] disabled:opacity-50';

/**
 * Admin: secret share link of a file – anybody with the link may download it, also when the
 * file is only visible to signed-in users. Create, copy / share, renew (old link dies), revoke.
 */
export const ShareLinkSection: React.FC<IShareLinkSectionProps> = ({
  item,
  saving,
  onCreate,
  onRevoke,
}) => {
  const { t } = useTranslation('file-share');
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState<'create' | Confirm>(null);
  const url = item.shareToken ? fileShareLinkUrl(item.shareToken) : null;

  const copy = async (link: string) => {
    if (!(await copyText(link))) {
      toast.error(t('share.copyFailed'));
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const run = async (kind: 'create' | 'renew' | 'revoke') => {
    setBusy(kind);
    const result = kind === 'revoke' ? await onRevoke(item.id) : await onCreate(item.id);
    setBusy(null);
    setConfirm(null);
    if (!result.ok) toast.error(t(result.error ?? 'error.save'));
    else if (kind === 'revoke') toast.success(t('share.revoked'));
  };

  const share = async (link: string) => {
    try {
      await navigator.share({ title: item.title, url: link });
    } catch {
      /* closed by the user */
    }
  };

  return (
    <section aria-labelledby="file-share-link" className="rounded-xl border border-border/60 p-3.5">
      <div className="flex items-start gap-3">
        <Link2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h3 id="file-share-link" className="text-body font-semibold">
            {t('share.title')}
          </h3>
          <p className="text-caption text-muted-foreground">
            {url ? t('share.activeHint') : t('share.hint')}
          </p>
        </div>
      </div>

      {!url ? (
        <button
          type="button"
          onClick={() => void run('create')}
          disabled={saving}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-body font-bold text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {busy === 'create' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Link2 className="size-4" aria-hidden="true" />
          )}
          {t('share.create')}
        </button>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-1.5">
            <input
              readOnly
              value={url}
              onFocus={event => event.currentTarget.select()}
              aria-label={t('share.title')}
              className="h-11 min-w-0 flex-1 truncate rounded-xl border border-border/60 bg-foreground/[0.03] px-3 text-sm text-muted-foreground outline-none focus:border-foreground"
            />
            <button
              type="button"
              onClick={() => void copy(url)}
              aria-label={t('share.copy')}
              className={iconButton}
            >
              {copied ? (
                <Check className="size-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </button>
            {typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={() => void share(url)}
                aria-label={t('share.share')}
                className={iconButton}
              >
                <Share2 className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {confirm ? (
            <div
              role="alert"
              className="mt-3 rounded-xl bg-destructive/[0.07] p-3 text-caption text-foreground"
            >
              <p>{t(`share.confirm.${confirm}`)}</p>
              <div className="mt-2 flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => setConfirm(null)}
                  disabled={saving}
                  className={textButton}
                >
                  {t('form.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => void run(confirm)}
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-destructive px-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {busy === confirm && (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  )}
                  {t(`share.${confirm}`)}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap justify-end gap-1">
              <button
                type="button"
                onClick={() => setConfirm('renew')}
                disabled={saving}
                className={textButton}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {t('share.renew')}
              </button>
              <button
                type="button"
                onClick={() => setConfirm('revoke')}
                disabled={saving}
                className={`${textButton} text-destructive hover:bg-destructive/10`}
              >
                <Link2Off className="size-4" aria-hidden="true" />
                {t('share.revoke')}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
