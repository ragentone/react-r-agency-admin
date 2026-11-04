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

/** Field types a plugin may declare in its configuration, with the options each one accepts. */
const CONFIG_TYPES = [
  { type: 'string', options: 'minLength, maxLength, pattern, default' },
  { type: 'text', options: 'minLength, maxLength, pattern, default' },
  { type: 'number', options: 'min, max, default' },
  { type: 'boolean', options: 'default' },
  { type: 'select', options: 'options, default' },
] as const;

/** Reference table of the configuration field types, shown on the plugin page. */
export const PluginConfigTypesTable: React.FC = () => {
  const { t } = useTranslation('admin');

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-body font-bold">{t('plugins.configTypes.title')}</h2>
      <div className="overflow-x-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('plugins.configTypes.type')}</TableHead>
              <TableHead>{t('plugins.configTypes.control')}</TableHead>
              <TableHead>{t('plugins.configTypes.options')}</TableHead>
              <TableHead>{t('plugins.configTypes.description')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CONFIG_TYPES.map(row => (
              <TableRow key={row.type}>
                <TableCell className="font-mono font-bold">{row.type}</TableCell>
                <TableCell>{t(`plugins.configTypes.rows.${row.type}.control`)}</TableCell>
                <TableCell className="font-mono text-caption text-muted-foreground">{row.options}</TableCell>
                <TableCell className="whitespace-normal text-caption text-muted-foreground">
                  {t(`plugins.configTypes.rows.${row.type}.description`)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};
