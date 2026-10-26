import { FieldGroup } from '@ui/shad-cn/components/field';
import React from 'react';

import { CreatePasswordFormConfirmPasswordField } from './CreatePasswordFormConfirmPasswordField';
import { CreatePasswordFormPasswordField } from './CreatePasswordFormPasswordField';

export interface CreatePasswordFormFieldsProps {
  className?: string;
  disabled?: boolean;
}

export const CreatePasswordFormFields: React.FC<CreatePasswordFormFieldsProps> = ({
  className,
  disabled,
}) => {
  return (
    <FieldGroup className={className}>
      <CreatePasswordFormPasswordField disabled={disabled} />
      <CreatePasswordFormConfirmPasswordField disabled={disabled} />
    </FieldGroup>
  );
};
