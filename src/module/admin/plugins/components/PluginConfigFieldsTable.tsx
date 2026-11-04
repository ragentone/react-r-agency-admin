import { Delayed } from '@ui/patterns';
import { Button } from '@ui/shad-cn/components/button.tsx';
import { Skeleton } from '@ui/shad-cn/components/skeleton.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/shad-cn/components/table.tsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { localizedText } from '../config.utils';
import { usePluginConfigFields } from '../hooks/use-plugin-config-fields';
import type { IPluginConfigField } from '../types';

/** Configuration fields of a plugin as a read-only table. */
export const PluginConfigFieldsTable: React.FC<{ pluginId: string }> = ({ pluginId }) => {
  const { t, i18n } = useTranslation('admin');
  const { loading, error, fields, retry } = usePluginConfigFields(pluginId);

  const defaultOf = (field: IPluginConfigField) => (field.default === undefined ? '—' : String(field.default));

  let body: React.ReactNode;
  if (loading) {
    body = (
      <Delayed className="min-h-24">
        <Skeleton className="h-24 w-full" />
      </Delayed>
    );
  } else if (error) {
    body = (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border p-3">
        <p className="text-caption text-destructive">{t('plugins.config.errors.load')}</p>
        <Button variant="outline" size="md" onClick={retry}>
          {t('plugins.error.retry')}
        </Button>
      </div>
    );
  } else if (fields.length === 0) {
    body = <p className="text-caption text-muted-foreground">{t('plugins.configFields.empty')}</p>;
  } else {
    body = (
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('plugins.configFields.key')}</TableHead>
              <TableHead>{t('plugins.configFields.label')}</TableHead>
              <TableHead>{t('plugins.configFields.type')}</TableHead>
              <TableHead>{t('plugins.configFields.required')}</TableHead>
              <TableHead>{t('plugins.configFields.default')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map(field => (
              <TableRow key={field.key}>
                <TableCell className="font-mono font-bold">{field.key}</TableCell>
                <TableCell>{localizedText(field.label, i18n.language) ?? field.key}</TableCell>
                <TableCell className="font-mono text-caption">{field.type}</TableCell>
                <TableCell>{field.required ? t('plugins.configFields.yes') : t('plugins.configFields.no')}</TableCell>
                <TableCell className="font-mono text-caption text-muted-foreground">{defaultOf(field)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body font-bold">{t('plugins.configFields.title')}</h2>
      {body}
    </section>
  );
};
