import { RoutePage } from '@router/components';

import { TodoList } from './TodoList';

const PageDeveloper = () => {
  return (
    <RoutePage
      classes={{ scroll: 'border-x-0', content: 'border-x-0' }}
      width={'100%'}
      scrollable={true}
    >
      <TodoList />
    </RoutePage>
  );
};

export { PageDeveloper };
