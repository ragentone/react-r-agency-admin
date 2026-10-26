import { cn } from '@ui/lib';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useMenu } from '../hooks';
import { MenuDrawer } from './MenuDrawer.tsx';

/**
 * Opens the mobile menu drawer (burger icon). Rendered in the mobile dock,
 * hidden from `md` (the sidebar takes over).
 */
const MenuTrigger = ({ className }: { className?: string }) => {
  const { t } = useTranslation('menu');
  const { items, hidden } = useMenu();
  const [open, setOpen] = useState(false);

  if (hidden || items.length === 0) return null;

  return (
    <>
      <button
        type={'button'}
        aria-label={t('open')}
        aria-expanded={open}
        aria-haspopup={'dialog'}
        onClick={() => setOpen(true)}
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full text-foreground outline-none transition-[background-color,transform] hover:bg-foreground/[0.06] active:scale-95 focus-visible:ring-2 focus-visible:ring-ring/50 [-webkit-tap-highlight-color:transparent]',
          className
        )}
      >
        <Menu className={'size-[22px]'} />
      </button>
      <MenuDrawer open={open} onOpenChange={setOpen} />
    </>
  );
};

export { MenuTrigger };
