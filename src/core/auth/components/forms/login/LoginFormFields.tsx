import { FieldGroup } from '@ui/shad-cn/components/field';
import React from 'react';

import { LoginFormEmailField } from './LoginFormEmailField';
import { LoginFormPasswordField } from './LoginFormPasswordField';

export interface LoginFormFieldsProps {
  className?: string;
  disabled?: boolean;
}

export const LoginFormFields: React.FC<LoginFormFieldsProps> = ({ className, disabled }) => {
  return (
    <FieldGroup className={className}>
      <LoginFormEmailField disabled={disabled} />
      <LoginFormPasswordField disabled={disabled} />
    </FieldGroup>
  );
};
