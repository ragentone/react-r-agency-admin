import { cn } from '@ui/lib';

import { type ICmsContainerProps } from '../types.ts';
import { CmsItem } from './CmsItem.tsx';
import { useCms } from './use.cms.ts';

/**
 * CmsContainer is a functional component used for rendering a collection of CMS-managed items.
 * It fetches the items corresponding to the specified name property from the CmsManager, filters
 * out any disabled items, sorts them by their sortOrder property, and then renders them using either
 * a custom render function provided via props or a default component rendering strategy.
 */
const CmsContainer = <P extends Record<string, any>>({
  name,
  render,
  children,
  payload,
  wrapper = false,
  className,
  style,
}: ICmsContainerProps<P>) => {
  const { getItems } = useCms();

  const renderItems = (position: 'before' | 'after') =>
    getItems(name, position).map((item, index) => {
      const node = (
        <CmsItem payload={payload} index={index} component={item} key={item.id} wrapper={null} />
      );
      return render ? render({ id: item.id, node, position: item.position, index }) : node;
    });

  const content = (
    <>
      {renderItems('before')}
      {children}
      {renderItems('after')}
    </>
  );

  return wrapper ? (
    <div style={style} className={cn(className)}>
      {content}
    </div>
  ) : (
    content
  );
};

export { CmsContainer };
