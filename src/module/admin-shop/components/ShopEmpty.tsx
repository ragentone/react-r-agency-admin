import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@ui/shad-cn/components/empty.tsx';

interface IProps {
  title: string;
  description?: string;
}

/** Empty / not-found state (shadcn Empty). */
export const ShopEmpty = ({ title, description }: IProps) => (
  <Empty>
    <EmptyHeader>
      <EmptyTitle>{title}</EmptyTitle>
      {description ? <EmptyDescription>{description}</EmptyDescription> : null}
    </EmptyHeader>
  </Empty>
);
