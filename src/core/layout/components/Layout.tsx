import { useAuth } from '@core/auth/components/use.auth.ts';
import { MobileDock } from '@core/dock/components';
import { useEvents } from '@core/event';
import { MenuSectionDrawerHost, MenuSidebar } from '@core/menu/components';
import { useMeshState } from '@core/mesh/components/use.mesh.ts';
import { Outlet } from '@tanstack/react-router';
import { cn } from '@ui/lib';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { useEffect } from 'react';

/**
 * Represents the main layout component for the application.
 * Mobile: content full height, floating dock at the bottom (menu + page actions, see core/dock).
 * From `md`: navigation sidebar left of the content. No page header / footer.
 * It is designed to occupy the full viewport dimensions and maintains a flexible column-oriented layout.
 * The content within the layout is rendered dynamically through the `Outlet` component.
 */
const Layout = () => {
  const { connected } = useMeshState();
  const { loaded } = useAuth();
  const { core } = useEvents();

  const renderOutlet = () => {
    if (!connected || !loaded) {
      return (
        <div className={'relative w-full h-full flex justify-center items-center'}>
          <Spinner className={'size-24'} />
        </div>
      );
    }
    return <Outlet />;
  };

  useEffect(() => {
    void core.emit('layout:rendered');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn('relative flex flex-col w-full h-full min-h-dvh max-h-dvh overflow-hidden')}
      style={{
        height: '100dvh',
        width: '100dvw',
        minHeight: '100dvh',
        maxHeight: '100dvh',
      }}
    >
      <div className={'relative flex grow w-full min-h-0 overflow-hidden'}>
        <MenuSidebar />
        <div className={'relative grow min-w-0 h-full overflow-hidden'}>{renderOutlet()}</div>
      </div>
      {/* Dock with registered buttons (menu, search, page actions …) – skeleton until loaded. */}
      <MobileDock loading={!connected || !loaded} />
      {/* Bottom drawer of menu sections with `display: 'drawer'` (apps). */}
      <MenuSectionDrawerHost />
    </div>
  );
};

export { Layout };
