import { cn } from '@ui/lib';
import { Item, ItemContent, ItemGroup } from '@ui/shad-cn/components/item.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/shad-cn/components/select.tsx';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

type TStrDate = `${string}-${string}-${string}`;
type TDate = TStrDate | Date;

interface IDateChangeEvent {
  date: Date;
  inPast: boolean;
  inFuture: boolean;
  isCurrent: boolean;
  daysAgo: number;
  month: number;
  year: number;
  day: number;
}

interface IRenderArgs {
  event: IDateChangeEvent | undefined;
}

interface IProps {
  date?: TDate;
  maxYears?: number;
  fromYears?: number;
  keepEmpty?: boolean;
  onDateChange?: (event: IDateChangeEvent) => void;
  showWeekdays?: boolean;
  weekdayFormat?: 'long' | 'short' | 'narrow';
  description?: string;
  label?: string;
  labelInside?: boolean;
  outline?: boolean;
  className?: string;
  error?: string;
  children?: (args: IRenderArgs) => ReactNode;
}

function daysAgo(date: Date | string): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

const DateSelector = (props: IProps) => {
  const { fromYears, maxYears } = props;
  const { t, i18n } = useTranslation('i18n');
  const initRef = useRef(true);

  const getInitDate = useCallback((): Date | undefined => {
    if (!props.date && props.keepEmpty) {
      return undefined;
    }
    return typeof props.date === 'string' ? new Date(props.date) : props.date;
  }, [props.date, props.keepEmpty]);

  useEffect(() => {
    if (!props.date && props.keepEmpty) {
      initRef.current = false;
    }
  }, [props.date, props.keepEmpty]);

  const [year, setYear] = useState<number>(() => {
    const date = getInitDate();
    return date ? date.getFullYear() : 0;
  });

  const [month, setMonth] = useState<number>(() => {
    const date = getInitDate();
    return date ? date.getMonth() + 1 : 0;
  });

  const [day, setDay] = useState<number | undefined>(() => {
    const date = getInitDate();
    return date ? date.getDate() : 0;
  });

  const [event, setEvent] = useState<IDateChangeEvent | undefined>(undefined);

  const [years] = useState<number[]>(() => {
    const year = fromYears ?? 1940;
    const max = maxYears ?? 250;
    return Array.from<number>({ length: max }).map((_, c) => {
      return c + year;
    });
  });

  const [days, setDays] = useState<number[]>([]);

  const set_year = useCallback((y: string) => {
    setYear(Number(y));
  }, []);

  const set_month = useCallback((m: string) => {
    setMonth(Number(m));
  }, []);

  const set_day = useCallback((d: string) => {
    setDay(Number(d));
  }, []);

  const getWeekday = useCallback(
    (day: number) => {
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString(i18n.language, {
        weekday: props.weekdayFormat ?? 'short',
        localeMatcher: 'lookup',
      });
    },
    [i18n.language, month, props.weekdayFormat, year]
  );

  const createEvent = useCallback((date: Date): IDateChangeEvent => {
    const currentDate = new Date();
    return {
      date: date,
      inPast: date < currentDate,
      inFuture: date > currentDate,
      isCurrent: date.getDate() === currentDate.getDate(),
      daysAgo: daysAgo(date),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }, []);

  useEffect(() => {
    const init = () => {
      if (!year || !month) return;
      const days_in_month = new Date(year, month, 0).getDate();
      setDays(Array.from({ length: days_in_month }, (_, i) => i + 1));
    };
    init();
  }, [month, year]);

  useEffect(() => {
    if (initRef.current) {
      initRef.current = false;
      return;
    }
    if (!year || !month || !day) return;
    if (year === 0 || month === 0 || day === 0) return;
    const date = new Date(year, month - 1, day);
    const event = createEvent(date);
    if (!props.onDateChange) return;
    props.onDateChange(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day]);

  useEffect(() => {
    if (!year || !month || !day) return;
    if (year === 0 || month === 0 || day === 0) return;
    const date = new Date(year, month - 1, day);
    const event = createEvent(date);
    setEvent(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day]);

  return (
    <ItemGroup
      className={cn(
        'gap-4',
        {
          'border rounded-lg shadow p-4': props.outline,
        },
        props.className
      )}
    >
      <Item className={cn('p-0')}>
        <ItemContent>
          <div className={'grid md:grid-cols-3 grid-cols-2 gap-2'}>
            <Select value={year?.toString()} onValueChange={set_year}>
              <SelectTrigger
                className={cn('cursor-pointer', {
                  'shadow-none': props.outline,
                })}
              >
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent className={'max-h-52'}>
                {years.map(n => {
                  return (
                    <SelectItem className={'cursor-pointer'} key={n} value={n.toString()}>
                      <span className={'font-bold'}>{n}</span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select value={month?.toString()} onValueChange={set_month}>
              <SelectTrigger
                className={cn('cursor-pointer', {
                  'shadow-none': props.outline,
                })}
              >
                <SelectValue></SelectValue>
              </SelectTrigger>
              <SelectContent className={'max-h-52'}>
                {months.map(n => {
                  return (
                    <SelectItem className={'cursor-pointer'} key={n} value={n.toString()}>
                      <div className={'flex flex-row gap-2 w-full items-center'}>
                        <span className={'font-bold'}>
                          {n.toString().length === 2 ? `${n}` : `0${n}`}
                        </span>
                        <span className={'text-muted-foreground'}>{t(`months.number.${n}`)}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Select disabled={days.length === 0} value={day?.toString()} onValueChange={set_day}>
              <SelectTrigger
                className={cn('cursor-pointer', {
                  'shadow-none': props.outline,
                })}
              >
                <SelectValue placeholder={t('label.selectDay')} />
              </SelectTrigger>
              <SelectContent className={'max-h-64'}>
                {days.map(n => {
                  return (
                    <SelectItem className={'cursor-pointer'} key={n} value={n.toString()}>
                      <div className={'flex flex-row gap-2'}>
                        <span className={'font-bold'}>
                          {n.toString().length === 2 ? `${n}` : `0${n}`}
                        </span>
                        {props.showWeekdays && (
                          <span className={'text-muted-foreground first-letter:uppercase'}>
                            {getWeekday(n)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </ItemContent>
      </Item>
      {props.children && (
        <Item className={'p-0'}>
          <ItemContent>{props.children({ event })}</ItemContent>
        </Item>
      )}
    </ItemGroup>
  );
};

export { DateSelector };
