import { cn } from '@ui/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select';
import { CircleHelp, type LucideIcon, Mars, Venus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type AccountGender = 'male' | 'female' | 'unknown';

/** Each gender with its icon and translation key. */
const GENDER_OPTIONS: { value: AccountGender; icon: LucideIcon; labelKey: string }[] = [
  { value: 'male', icon: Mars, labelKey: 'form.genderMale' },
  { value: 'female', icon: Venus, labelKey: 'form.genderFemale' },
  { value: 'unknown', icon: CircleHelp, labelKey: 'form.genderUnknown' },
];

export interface AccountGenderSelectProps {
  id?: string;
  /** Form values are plain strings, so the value is typed as string here. */
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

/** Gender select for the account form: every option shows its icon, in the trigger too. */
export const AccountGenderSelect: React.FC<AccountGenderSelectProps> = ({
  id,
  value,
  onValueChange,
  disabled,
  invalid,
  className,
}) => {
  const { t } = useTranslation('account');

  return (
    <Select
      disabled={disabled}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger id={id} aria-invalid={invalid} className={cn('w-full', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {GENDER_OPTIONS.map(({ value: optionValue, icon: Icon, labelKey }) => (
          <SelectItem key={optionValue} value={optionValue}>
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              {t(labelKey)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
