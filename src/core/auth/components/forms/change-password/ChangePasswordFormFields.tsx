import React from 'react';

import { ChangePasswordFormConfirmPasswordField } from './ChangePasswordFormConfirmPasswordField';
import { ChangePasswordFormCurrentPasswordField } from './ChangePasswordFormCurrentPasswordField';
import { ChangePasswordFormNewPasswordField } from './ChangePasswordFormNewPasswordField';

export interface ChangePasswordFormFieldsProps {
  className?: string;
}

export const ChangePasswordFormFields: React.FC<ChangePasswordFormFieldsProps> = ({
  className,
}) => {
  return (
    <div className={className ?? 'space-y-4'}>
      <ChangePasswordFormCurrentPasswordField />
      <ChangePasswordFormNewPasswordField />
      <ChangePasswordFormConfirmPasswordField />
    </div>
  );
};
