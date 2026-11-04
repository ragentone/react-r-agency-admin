import { UserGreeting } from '@core/auth';
import { CmsContainer } from '@core/cms';
import { PluginSlot } from '@core/plugin';
import { RoutePage } from '@router/components';

const PageIndex = () => {
  return (
    // Phones: the feed runs edge to edge (no page padding), padded column from `sm`.
    <RoutePage width={620} scrollable={true} classes={{ scroll: 'p-0' }}>
      {() => {
        return (
          <CmsContainer name={'page-index'}>
            <div className={'py-4 sm:bx-6 px-4 border-b border-border/50'}>
              <UserGreeting />
            </div>
            <PluginSlot
              name="home.widget"
              scope="admin"
              className="border-b border-border/50 px-4 py-3"
            />
          </CmsContainer>
        );
      }}
    </RoutePage>
  );
};

export { PageIndex };
