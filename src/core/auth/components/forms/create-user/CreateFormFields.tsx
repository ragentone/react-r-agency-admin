import { FieldGroup } from '@ui/shad-cn/components/field';
import React from 'react';

import { CreateFormAliasField } from './CreateFormAliasField';
import { CreateFormEmailField } from './CreateFormEmailField';
import { CreateFormPasswordField } from './CreateFormPasswordField';

export interface CreateFormFieldsProps {
  className?: string;
  disabled?: boolean;
}

export const CreateFormFields: React.FC<CreateFormFieldsProps> = ({ className, disabled }) => {
  return (
    <FieldGroup className={className}>
      <CreateFormAliasField disabled={disabled} />
      <CreateFormEmailField disabled={disabled} />
      <CreateFormPasswordField disabled={disabled} />
    </FieldGroup>
  );
};
