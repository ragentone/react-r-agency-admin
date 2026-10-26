import type { IAccountFormValues } from '@core/account/types';
import { cn } from '@ui/lib';
import { FieldGroup } from '@ui/shad-cn/components/field';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@ui/shad-cn/components/item.tsx';
import { Switch } from '@ui/shad-cn/components/switch';
import { useFormikContext } from 'formik';
import { Eye, Globe, Mail, Search } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface AccountPrivacyFieldsProps {
  disabled?: boolean;
  className?: string;
}

export const AccountPrivacyFields: React.FC<AccountPrivacyFieldsProps> = ({
  disabled,
  className,
}) => {
  const { t } = useTranslation('account');
  const formik = useFormikContext<IAccountFormValues>();

  const isSubmitting = formik?.isSubmitting ?? false;
  const isDisabled = disabled ?? isSubmitting;

  const items = [
    {
      id: 'account-public',
      field: 'public' as const,
      icon: Globe,
      title: t('form.public'),
      desc: t('form.publicDesc'),
    },
    {
      id: 'account-searchable',
      field: 'searchable' as const,
      icon: Search,
      title: t('form.searchable'),
      desc: t('form.searchableDesc'),
    },
    {
      id: 'account-showEmail',
      field: 'showEmail' as const,
      icon: Mail,
      title: t('form.showEmail'),
      desc: t('form.showEmailDesc'),
    },
    {
      id: 'account-showFullName',
      field: 'showFullName' as const,
      icon: Eye,
      title: t('form.showFullName'),
      desc: t('form.showFullNameDesc'),
    },
  ];

  return (
    <FieldGroup className={className}>
      <div className="divide-y divide-border/50 border-y border-border/50">
        {items.map(item => {
          const Icon = item.icon;
          const isChecked = Boolean(formik?.values?.[item.field]);
          return (
            // Whole row is a <label>: tapping anywhere toggles the switch (bigger touch target).
            <Item
              key={item.id}
              asChild
              size={'sm'}
              className={cn(
                'min-h-15 cursor-pointer gap-4 rounded-none border-0 px-4 py-3 select-none transition-colors hover:bg-foreground/[0.03] active:bg-foreground/[0.06]',
                isDisabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <label htmlFor={item.id}>
                <ItemMedia>
                  <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-body font-normal">{item.title}</ItemTitle>
                  <ItemDescription className="text-caption leading-4 line-clamp-none">
                    {item.desc}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Switch
                    id={item.id}
                    disabled={isDisabled}
                    checked={isChecked}
                    onCheckedChange={checked => formik?.setFieldValue(item.field, checked)}
                    className="shrink-0"
                  />
                </ItemActions>
              </label>
            </Item>
          );
        })}
      </div>
    </FieldGroup>
  );
};
