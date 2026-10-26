import { cn } from '@ui/lib';
import { Eye, EyeOff, X } from 'lucide-react';
import {
  type AriaAttributes,
  type HTMLInputTypeAttribute,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

type InputValue = string | undefined;

export interface IBaseInputProps {
  roundedFull?: boolean;
  value?: InputValue;
  type?: HTMLInputTypeAttribute | undefined;
  onChange?: (value: InputValue) => void;
  onEnter?: (value: InputValue) => void;
  clearable?: boolean;
  toViewOnFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  size?: 'sm' | 'md' | 'lg';
  role?: string;
  id?: string;
  name?: string;
  aria?: AriaAttributes;
  disabled?: boolean;
  placeholder?: string;
  invalid?: boolean;
  icon?: ReactNode;
}

export const BaseInput = (props: IBaseInputProps) => {
  const fieldRef = useRef<HTMLDivElement>(null);
  const initRef = useRef<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = props.type === 'password';
  const [value, setValue] = useState<string | undefined>(props.value);
  const hasValue = !!value;
  const showClear = props.clearable !== false && hasValue;
  const inputType = isPassword && showPassword ? 'text' : props.type;
  const handleClear = () => setValue('');

  const [focused, setFocused] = useState(false);

  const size = props.size ?? 'sm';

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
            'rounded-full': props.roundedFull,
            'ring-[3px] ring-ring/32': focused,
          },
          {
            'h-10': size === 'sm',
            'h-12': size === 'md',
            'h-14': size === 'lg',
          },
          {
            'px-3': size === 'sm',
            'px-4': size === 'md',
            'px-5': size === 'lg',
          }
        )}
      >
        <div className={'flex items-center justify-center h-full'}>
          {props.icon && <div className={'mr-2'}>{props.icon}</div>}
          <div className={'flex flex-col grow'}>
            <input
              id={props.id}
              name={props.name}
              role={props.role}
              value={value}
              type={inputType}
              onChange={e => setValue(e.target.value)}
              disabled={props.disabled}
              placeholder={props.placeholder}
              className={cn('outline-none grow', [
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
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  props.onEnter?.(value);
                }
              }}
              {...props.aria}
            />
          </div>
          <div className={'flex gap-2 pl-3'}>
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
            {isPassword && (
              <button
                disabled={props.disabled}
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
