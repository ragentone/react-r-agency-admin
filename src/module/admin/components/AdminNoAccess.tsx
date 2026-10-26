import { ShieldOff } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const AdminNoAccess: React.FC = () => {
  const { t } = useTranslation('admin');
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-8 py-20 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-foreground/[0.07]">
        <ShieldOff className="size-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-title font-bold">{t('noAccess.title')}</h1>
      <p className="mt-1 text-body text-muted-foreground">{t('noAccess.description')}</p>
    </div>
  );
};
