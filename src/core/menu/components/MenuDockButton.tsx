import { MenuTrigger } from './MenuTrigger.tsx';

/**
 * Menu trigger (avatar / burger) inside the mobile dock – registered in `core.tsx`.
 * Renders nothing when the menu is hidden or empty. Phones only – from `md` the sidebar is the
 * main menu.
 */
const MenuDockButton = () => <MenuTrigger className={'size-11 md:hidden'} />;

export { MenuDockButton };
