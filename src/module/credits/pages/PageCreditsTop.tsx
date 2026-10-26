import { RoutePage } from '@router/components';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { CreditsTopList } from '../components/CreditsTopList.tsx';
import { CreditsPageHeader } from '../components/CreditsUi.tsx';

/** `/credits/top`: public – the three richest users. */
export const PageCreditsTop: React.FC = () => {
  const { t } = useTranslation('credits');
  return (
    <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
      <div data-slot="credits-top" className="mx-auto flex min-h-dvh w-full flex-col bg-background">
        <CreditsPageHeader title={t('top.title')} subtitle={t('top.subtitle')} />
        <CreditsTopList />
      </div>
    </RoutePage>
  );
};
