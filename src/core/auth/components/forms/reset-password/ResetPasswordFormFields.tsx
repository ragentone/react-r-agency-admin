import { FieldGroup } from '@ui/shad-cn/components/field';
import React from 'react';

import { ResetPasswordFormEmailField } from './ResetPasswordFormEmailField';

export interface ResetPasswordFormFieldsProps {
  className?: string;
  disabled?: boolean;
}

export const ResetPasswordFormFields: React.FC<ResetPasswordFormFieldsProps> = ({
  className,
  disabled,
}) => {
  return (
    <FieldGroup className={className}>
      <ResetPasswordFormEmailField disabled={disabled} />
    </FieldGroup>
  );
};
