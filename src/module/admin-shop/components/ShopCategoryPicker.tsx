import { Button } from '@ui/shad-cn/components/button.tsx';
import { useTranslation } from 'react-i18next';

import { useShopCategories } from '../hooks';

interface IProps {
  shopId: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

/** Pills: no category + all categories of the shop (renders nothing without categories). */
export const ShopCategoryPicker = ({ shopId, value, onChange }: IProps) => {
  const { t } = useTranslation('admin-shop');
  const { data } = useShopCategories(shopId);
  if (data.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{t('category.label')}</span>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          pill
          variant={value === null ? 'default' : 'outline'}
          onClick={() => onChange(null)}
        >
          {t('category.none')}
        </Button>
        {data.map(category => (
          <Button
            key={category.id}
            size="sm"
            pill
            variant={value === category.id ? 'default' : 'outline'}
            onClick={() => onChange(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
