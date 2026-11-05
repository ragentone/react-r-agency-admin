import { Button } from '@ui/shad-cn/components/button.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@ui/shad-cn/components/popover.tsx';
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminDocSearch, type IAdminDocSearchProps } from './AdminDocSearch';

/** Drawer header button: opens the search for the open doc in a popover. */
export const AdminDocSearchPopover: React.FC<IAdminDocSearchProps> = props => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={t('docs.search.open')}
          title={t('docs.search.open')}
        >
          <Search className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-2">
        <AdminDocSearch {...props} />
      </PopoverContent>
    </Popover>
  );
};
