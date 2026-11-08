import { cn } from '@ui/lib/utils';
import { AppDrawer } from '@ui/patterns';
import { Badge } from '@ui/shad-cn/components/badge.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { IDebugReport } from '../types';

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: IDebugReport | null;
}

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <dt className="text-caption font-bold text-muted-foreground">{label}</dt>
    <dd className="text-body break-all text-foreground">{children}</dd>
  </div>
);

/** Full view of one client debug report (drawer, mobile first). */
export const DebugReportDrawer: React.FC<IProps> = ({ open, onOpenChange, report }) => {
  const { t, i18n } = useTranslation('admin-debug');
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'medium' });

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('detail.title')}
      size="full"
      bodyKey={report?.id}
      contentProps={{ className: 'max-w-[56rem]' }}
    >
      {report && (
        <dl className="space-y-4 px-4 pt-2 pb-6">
          <Field label={t('detail.level')}>
            <Badge
              variant={report.level === 'error' ? 'destructive' : 'outline'}
              className={report.level === 'error' ? 'text-white' : undefined}
            >
              {report.level}
            </Badge>
          </Field>
          <Field label={t('detail.createdAt')}>{formatTime(report.createdAt)}</Field>
          <Field label={t('detail.reportedAt')}>{formatTime(report.reportedAt)}</Field>
          <Field label={t('detail.tag')}>
            <span className="font-mono text-caption">{report.tag}</span>
          </Field>
          <Field label={t('detail.message')}>{report.message}</Field>
          <Field label={t('detail.error')}>
            {report.error ? (
              <pre
                className={cn(
                  'max-h-72 overflow-auto rounded-xl border border-border/50 bg-foreground/[0.04] p-3',
                  'font-mono text-micro whitespace-pre-wrap break-all text-foreground'
                )}
              >
                {report.error}
              </pre>
            ) : (
              <span className="text-muted-foreground">–</span>
            )}
          </Field>
          <Field label={t('detail.device')}>
            <span className="font-mono text-caption">{report.deviceId}</span>
          </Field>
          <Field label={t('detail.id')}>
            <span className="font-mono text-caption">{report.id}</span>
          </Field>
        </dl>
      )}
    </AppDrawer>
  );
};
