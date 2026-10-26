import { cn } from '@ui/lib/utils.ts';
import { useTimeAgo } from 'next-timeago';
import { useTranslation } from 'react-i18next';

interface IProps {
  date: Date;
  className?: string;
  autoUpdate?: boolean;

  onClick?(date: Date): void;
}

const TimeAgoLabel = ({ date, className, onClick, autoUpdate }: IProps) => {
  const { TimeAgo } = useTimeAgo();
  const { i18n } = useTranslation();

  const handleClick = () => {
    if (!onClick) return;
    onClick(date);
  };

  return (
    <span
      onClick={handleClick}
      className={cn(className, {
        'cursor-pointer': onClick,
      })}
    >
      <TimeAgo live={autoUpdate} date={date} locale={i18n.language} />
    </span>
  );
};

export { TimeAgoLabel };
