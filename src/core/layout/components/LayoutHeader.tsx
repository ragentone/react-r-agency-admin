import { PluginSlot, usePluginSlot } from '@core/plugin';

interface IProps {
  loading: boolean;
}

/** Header area. Plugins render into `header.widget`; without plugins nothing is shown. */
export const LayoutHeader = ({ loading }: IProps) => {
  const length = usePluginSlot('header.widget').length;
  if (length === 0) return null;
  if (loading) return null;
  return <PluginSlot name={'header.widget'} scope={'admin'} />;
};
