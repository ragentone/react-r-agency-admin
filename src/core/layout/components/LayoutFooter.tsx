import { MobileDock } from '@core/dock';
import { PluginSlot } from '@core/plugin';

interface IProps {
  loading: boolean;
}

export const LayoutFooter = ({ loading }: IProps) => {
  return (
    <div className={'flex flex-col'}>
      <PluginSlot scope={'admin'} name={'footer.widget'} />
      <MobileDock loading={loading} />
    </div>
  );
};
