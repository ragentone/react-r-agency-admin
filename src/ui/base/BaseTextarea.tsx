import { cn } from '@ui/lib';
import { X } from 'lucide-react';
import { type AriaAttributes, useEffect, useRef, useState } from 'react';

type InputValue = string | undefined;

export interface IBaseTextareaProps {
  value?: InputValue;
  onChange?: (value: InputValue) => void;
  onEnter?: (value: InputValue) => void;
  clearable?: boolean;
  toViewOnFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  role?: string;
  id?: string;
  name?: string;
  aria?: AriaAttributes;
  disabled?: boolean;
  placeholder?: string;
  autoResize?: boolean;
  rows?: number;
  limit?: number;
  invalid?: boolean;
}

export const BaseTextarea = (props: IBaseTextareaProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initRef = useRef<boolean>(true);
  const [value, setValue] = useState<string | undefined>(props.value);
  const hasValue = !!value;
  const showClear = props.clearable !== false && hasValue;
  const handleClear = () => setValue('');

  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (props.autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value, props.autoResize]);

  useEffect(() => {
    const change = () => {
      if (initRef.current) {
        initRef.current = false;
        return;
      }
      props.onChange?.(value);
    };
    change();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div ref={fieldRef} className={cn('relative flex flex-col gap-1')}>
      <div
        data-invalid={props.invalid}
        className={cn(
          'flex flex-col w-full',
          [
            'dark:bg-input/30',
            'aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/24',
            'data-invalid:border-destructive data-invalid:text-destructive data-invalid:ring-[3px] data-invalid:ring-destructive/24',
            'dark:aria-invalid:border-destructive-foreground dark:aria-invalid:text-destructive-foreground dark:aria-invalid:ring-destructive-foreground/40',
            'dark:data-invalid:border-destructive-foreground dark:data-invalid:text-destructive-foreground dark:data-invalid:ring-destructive-foreground/40',
          ],
          {
            'rounded-lg border border-input shadow-xs/5': true,
            'ring-[3px] ring-ring/32': focused,
          },
          {
            'p-3': true,
          }
        )}
      >
        <div className={'flex items-center justify-center h-full'}>
          <div className={'flex flex-col gap-2 grow'}>
            <textarea
              ref={textareaRef}
              id={props.id}
              name={props.name}
              role={props.role}
              value={value}
              maxLength={props.limit}
              onChange={e => {
                const nextVal =
                  props.limit !== undefined ? e.target.value.slice(0, props.limit) : e.target.value;
                setValue(nextVal);
              }}
              disabled={props.disabled}
              placeholder={props.placeholder}
              rows={props.rows ?? (props.autoResize ? 1 : 4)}
              className={cn('outline-none grow resize-none', [
                'peer',
                'w-full min-w-0',
                'text-base md:text-sm',
                'placeholder:text-muted-foreground/64',
                'file:inline-flex file:h-7 file:items-center file:border-0',
                'file:font-medium file:text-foreground file:text-sm',
                'transition-[color,box-shadow]',
                'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-64',
                'motion-reduce:transition-none!',
              ])}
              onFocus={() => {
                if (props.toViewOnFocus) {
                  fieldRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
                setFocused(true);
              }}
              onBlur={() => setFocused(false)}
              {...props.aria}
            />
            {props.limit && (
              <div className={'flex gap-1 text-xs text-muted-foreground'}>
                <small>{value?.length ?? 0}</small>
                <small>/</small>
                <small>{props.limit}</small>
              </div>
            )}
          </div>
          <div className={'flex gap-2 pl-3 h-full items-start'}>
            {showClear && (
              <button
                disabled={props.disabled}
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear input"
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
