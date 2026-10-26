import { cn } from '@ui/lib/utils.ts';
import { useTranslation } from 'react-i18next';

import { formatDateTime } from '../actions/date.ts';
import { type DateTimeFormat, type Locales } from '../types.ts';

interface IProps {
  date: string | Date;
  format?: DateTimeFormat;
  className?: string;
  label?: string;
  transLabel?: boolean;
}

/**
 * DateTimeLabel component for formatting and displaying a date.
 *
 * This component takes a date and a format string as props and uses the
 * provided internationalization (i18n) settings to format the date according
 * to the specified format. The formatted date is displayed within a
 * `<label>` element with an accessible `aria-label`.
 */
const DateTimeLabel = ({ date, format = 'dateShort', className, label, transLabel }: IProps) => {
  const { i18n } = useTranslation();
  const formated = formatDateTime(date, format, i18n.language as Locales);
  return (
    <div className={cn('flex gap-2 items-center capitalize', className)}>
      {label && <label>{transLabel ? i18n.t(label) : label}</label>}
      <label aria-label={formated}>{formated}</label>
    </div>
  );
};

export default DateTimeLabel;
