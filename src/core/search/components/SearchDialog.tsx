import { AppDrawer } from '@ui/patterns';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSearchUi } from '../store';
import { type ISearchPanelProps, SearchPanel } from './SearchPanel';

export { type ISearchPanelProps, SearchPanel } from './SearchPanel';

/** Fallback if the open animation never reports completion (e.g. reduced motion). */
const OPEN_FALLBACK_MS = 600;

export interface ISearchDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectItem?: ISearchPanelProps['onSelectItem'];
}

/**
 * Search as bottom drawer. Render it inside another drawer to stack it on top
 * (base-ui nested drawers), e.g. in the friends drawer.
 */
export const SearchDrawer: React.FC<ISearchDrawerProps> = ({ open, onClose, onSelectItem }) => {
  const { t } = useTranslation('search');
  const [opened, setOpened] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setOpened(false);
  }
  useEffect(() => {
    if (!open || opened) return;
    const timer = window.setTimeout(() => setOpened(true), OPEN_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [open, opened]);

  return (
    <AppDrawer
      open={open}
      onOpenChange={next => !next && onClose()}
      onOpenChangeComplete={next => next && setOpened(true)}
      title={t('title')}
      description={t('placeholder')}
      hideHeader
      direction={'up'}
      subHeader={<div></div>}
    >
      {open && <SearchPanel onClose={onClose} focus={opened} onSelectItem={onSelectItem} />}
    </AppDrawer>
  );
};

/** Global search drawer. Open with ⌘K / Ctrl+K, "/" or `SearchManager.open()`. */
export const SearchDialog: React.FC = () => {
  const open = useSearchUi(state => state.open);
  const setOpen = useSearchUi(state => state.setOpen);
  return <SearchDrawer open={open} onClose={() => setOpen(false)} />;
};
