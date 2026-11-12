import { sql } from '@codemirror/lang-sql';
import { useTheme } from '@core/theme';
import { AppDrawer } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import CodeMirror from '@uiw/react-codemirror';
import { Code, Copy } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { buildDropSql } from '../db.drop.sql';
import type { IDbUsageTable } from '../types';

interface Props {
  candidates: IDbUsageTable[];
  database: string;
  generatedAt: string;
}

/** Summary line with a button; the read-only SQL opens in a drawer. Nothing is run here. */
export const DatabaseDropSql: React.FC<Props> = ({ candidates, database, generatedAt }) => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);

  if (!candidates.length) {
    return <p className="text-caption text-muted-foreground">{t('system.database.sql.empty')}</p>;
  }

  return (
    <section className="flex flex-col gap-2 border-t border-border/50 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-body font-bold">{t('system.database.sql.title')}</h4>
          <p className="text-caption text-muted-foreground">{t('system.database.sql.text')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Code className="size-4" />
          {t('system.database.sql.open')}
        </Button>
      </div>
      <DropSqlDrawer
        open={open}
        onOpenChange={setOpen}
        candidates={candidates}
        database={database}
        generatedAt={generatedAt}
      />
    </section>
  );
};

const DropSqlDrawer: React.FC<Props & { open: boolean; onOpenChange: (open: boolean) => void }> = ({
  open,
  onOpenChange,
  candidates,
  database,
  generatedAt,
}) => {
  const { t } = useTranslation('admin');
  const { theme } = useTheme();
  const text = useMemo(
    () =>
      buildDropSql(candidates, {
        database,
        generatedAt,
        header: [t('system.database.sql.header1'), t('system.database.sql.header2')],
      }),
    [candidates, database, generatedAt, t]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('system.database.sql.copied'));
    } catch {
      toast.error(t('system.database.sql.copyFailed'));
    }
  };

  return (
    <AppDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={t('system.database.sql.title')}
      autoHeight={true}
      footer={
        <Button size="xl" fullWidth onClick={() => void copy()}>
          <Copy className="size-4" />
          {t('system.database.sql.copy')}
        </Button>
      }
    >
      <CodeMirror
        value={text}
        readOnly
        editable={false}
        theme={theme === 'dark' ? 'dark' : 'light'}
        extensions={[sql()]}
        basicSetup={{ foldGutter: false, lineNumbers: false }}
        className="overflow-hidden rounded-xl border border-border text-caption"
      />
    </AppDrawer>
  );
};
