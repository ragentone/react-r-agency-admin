import React from 'react';
import { useTranslation } from 'react-i18next';

/** Tables the code expects but the database does not have. Usually the schema sync has not run yet. */
export const DatabaseMissingList: React.FC<{ missing: string[] }> = ({ missing }) => {
  const { t } = useTranslation('admin');
  if (!missing.length) return null;
  return (
    <section className="border-t border-border/50 pt-4">
      <h4 className="text-body font-bold">{t('system.database.missing.title')}</h4>
      <p className="text-caption text-muted-foreground">{t('system.database.missing.text')}</p>
      <ul className="mt-2 flex flex-col gap-1">
        {missing.map(name => (
          <li key={name} className="break-all text-caption">
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
};
