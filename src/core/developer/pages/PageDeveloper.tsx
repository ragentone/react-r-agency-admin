import { CmsContainer } from '@core/cms';
import { RoutePage } from '@router/components';
import { Button } from '@ui/shad-cn/components/button.tsx';

const PageDeveloper = () => {
  return (
    <RoutePage width={'100%'} scrollable={true}>
      <CmsContainer
        name={'page-developer'}
        className={'h-full py-6 flex items-center justify-center'}
      >
        <Button>
          developer
        </Button>
      </CmsContainer>
    </RoutePage>
  );
};

export { PageDeveloper };
