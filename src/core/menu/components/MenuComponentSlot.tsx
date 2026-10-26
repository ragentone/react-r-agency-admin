import type { IMenuComponentEntry, IMenuComponentProps } from '../types.ts';

interface IProps extends IMenuComponentProps {
  entry: IMenuComponentEntry;
}

/** Renders one registered menu component (skipped when hidden for the variant). */
const MenuComponentSlot = ({ entry, ...props }: IProps) => {
  if (entry.hideIn?.includes(props.variant)) return null;
  const Component = entry.component;
  return <Component {...props} />;
};

export { MenuComponentSlot };
