import { MobileDock } from '@core/dock';
import { PluginSlot } from '@core/plugin';

interface IProps {
  loading: boolean;
}

export const LayoutFooter = ({ loading }: IProps) => {
  return (
    <div className={'flex flex-col w-full border-t border-border/50'}>
      <PluginSlot name={'footer_before.widget'} />
      <div className={'flex w-full justify-center'}>
        <PluginSlot name={'footer_left.widget'} />
        <MobileDock loading={loading} />
        <PluginSlot name={'footer_right.widget'} />
      </div>
      <PluginSlot name={'footer_after.widget'} />
    </div>
  );
};
