import { type IRouterPageProps, RoutePage } from '@router/components';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@ui/shad-cn/components/empty';
import { FileQuestion } from 'lucide-react';
import type { ReactNode } from 'react';

export interface IEmptyPageProps extends IRouterPageProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

const EmptyPage = ({
  title = 'Empty Page',
  description = 'No content available for this page.',
  children,
  ...props
}: IEmptyPageProps) => {
  return (
    <RoutePage {...props}>
      <div className="flex h-full w-full items-center justify-center p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion className="h-6 w-6" />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
          </EmptyHeader>
          {children}
        </Empty>
      </div>
    </RoutePage>
  );
};

export { EmptyPage };
