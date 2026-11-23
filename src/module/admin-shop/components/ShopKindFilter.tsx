import { Button } from '@ui/shad-cn/components/button.tsx';
import { useTranslation } from 'react-i18next';

import type { ShopItemKind } from '../types';

interface IProps {
  value: ShopItemKind | null;
  onChange: (value: ShopItemKind | null) => void;
  /** Show the "all" pill (default). */
  withAll?: boolean;
}

const OPTIONS: (ShopItemKind | null)[] = [null, 'service', 'product'];

/** Pills: all / services / products. */
export const ShopKindFilter = ({ value, onChange, withAll = true }: IProps) => {
  const { t } = useTranslation('admin-shop');
  return (
    <div className="flex gap-2">
      {OPTIONS.filter(o => withAll || o).map(option => (
        <Button
          key={option ?? 'all'}
          size="sm"
          pill
          variant={value === option ? 'default' : 'outline'}
          onClick={() => onChange(option)}
        >
          {t(option ? `kind.${option}s` : 'kind.all')}
        </Button>
      ))}
    </div>
  );
};
