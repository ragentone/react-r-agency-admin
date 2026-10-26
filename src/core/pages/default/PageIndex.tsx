import { UserGreeting } from '@core/auth';
import { CmsContainer } from '@core/cms';
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
          </CmsContainer>
        );
      }}
    </RoutePage>
  );
};

export { PageIndex };
