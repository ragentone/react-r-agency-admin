import { Text as RACText, type TextProps } from 'react-aria-components';

import { cn } from '@ui/lib/utils';

export function Description(props: TextProps) {
  return (
    <RACText
      {...props}
      slot="description"
      className={cn('text-sm text-gray-600', props.className)}
    />
  );
}
