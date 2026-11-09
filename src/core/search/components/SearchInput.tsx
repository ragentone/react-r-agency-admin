import { Button } from '@ui/shad-cn/components/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@ui/shad-cn/components/input-group';
import { Spinner } from '@ui/shad-cn/components/spinner';
import { Search, X } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

export interface ISearchInputProps {
  inputRef: React.Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
  loading: boolean;
  activeDescendant?: string;
}

/** X-style pill search field + close (mobile: "Cancel" text, desktop: icon). */
export const SearchInput: React.FC<ISearchInputProps> = ({
  inputRef,
  value,
  onChange,
  onClear,
  onClose,
  loading,
  activeDescendant,
}) => {
  const { t } = useTranslation('search');

  return (
    <div className="flex items-center gap-2 px-4 pt-1 pb-3">
      <InputGroup className="h-11 rounded-full border-transparent bg-muted shadow-none focus-within:border-foreground focus-within:bg-background focus-within:ring-0 dark:bg-muted">
        <InputGroupAddon align="inline-start" className="ps-4">
          {loading ? (
            <Spinner aria-label={t('loading')} className="size-5" />
          ) : (
            <Search className="size-5" />
          )}
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          role="combobox"
          aria-expanded
          aria-autocomplete="list"
          aria-controls="search-listbox"
          aria-activedescendant={activeDescendant}
          className="h-full text-base placeholder:text-muted-foreground md:text-body [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <InputGroupAddon align="inline-end" className="pe-4">
            <InputGroupButton
              size="icon-xs"
              variant="default"
              aria-label={t('clear')}
              onClick={onClear}
            >
              <X />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <Button
        variant="ghost"
        size="icon-lg"
        className="hidden sm:inline-flex"
        aria-label={t('close')}
        onClick={onClose}
      >
        <X className="size-5" />
      </Button>
    </div>
  );
};
