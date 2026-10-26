import type { FunctionComponent } from 'react';

interface IOptions {
  size?: number;
}

const renderIcon = (
  icon: FunctionComponent<{ size?: number }> | undefined | null,
  options: IOptions = {}
) => {
  if (!icon) return null;
  const Element = icon;
  return <Element size={options.size} />;
};

export { renderIcon };
