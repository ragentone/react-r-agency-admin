import { Button } from '@ui/shad-cn/components/button.tsx';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ui/shad-cn/components/command.tsx';
import { Dialog, DialogContent, DialogTitle } from '@ui/shad-cn/components/dialog.tsx';
import { Spinner } from '@ui/shad-cn/components/spinner.tsx';
import { useDebounce } from '@uidotdev/usehooks';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminAvatar } from '../../components/AdminAvatar';
import { AdminUserBadges } from '../../components/AdminUserBadges';
import { ADMIN_SEARCH_DEBOUNCE, ADMIN_SEARCH_MIN } from '../../const';
import { useAdminUsers } from '../../hooks';

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * Search field look-alike → command dialog: find a user by alias / e-mail / id and open the
 * user drawer directly. ⌘K / Ctrl+K opens it from anywhere on the page.
 */
export const HomeUserSearch: React.FC<{ onUser: (userId: string) => void }> = ({ onUser }) => {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, ADMIN_SEARCH_DEBOUNCE);
  const { users, loading, loaded, error, search } = useAdminUsers();
  const searching = debounced.trim().length >= ADMIN_SEARCH_MIN;

  useEffect(() => {
    void search(debounced);
  }, [debounced, search]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(value => !value);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const change = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  const select = (userId: string) => {
    change(false);
    onUser(userId);
  };

  let status: React.ReactNode = null;
  if (!searching) {
    status = t('home.search.hint', { count: ADMIN_SEARCH_MIN });
  } else if (loading && !loaded) {
    status = <Spinner className="mx-auto size-5" aria-label={t('home.search.loading')} />;
  } else if (error && !users.length) {
    status = t('error.load');
  } else if (!users.length && !loading) {
    status = t('users.noResults', { term: debounced.trim() });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="h-11 w-full justify-start gap-3 rounded-full border-border/70 bg-foreground/[0.03] px-4 font-normal text-muted-foreground shadow-none hover:bg-foreground/[0.06]"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="flex-1 truncate text-left text-body">{t('home.search.placeholder')}</span>
        <kbd className="hidden rounded-md border border-border/70 px-1.5 py-0.5 font-sans text-micro font-semibold md:inline">
          {isMac() ? '⌘K' : 'Ctrl K'}
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={change}>
        <DialogContent className="top-[max(1rem,env(safe-area-inset-top))] w-[calc(100%-2rem)] max-w-lg translate-y-0 gap-0 overflow-hidden rounded-2xl p-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 sm:top-[15vh] sm:rounded-2xl">
          <DialogTitle className="sr-only">{t('home.search.title')}</DialogTitle>
          <Command shouldFilter={false} className="rounded-2xl bg-background">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={t('home.search.placeholder')}
              autoCapitalize="off"
              autoCorrect="off"
              className="h-14 pr-8 text-base sm:text-sm"
            />
            <CommandList className="max-h-[min(60vh,420px)]">
              {status && (
                <div
                  role="status"
                  className="px-4 py-8 text-center text-caption text-muted-foreground"
                >
                  {status}
                </div>
              )}
              {searching && users.length > 0 && (
                <CommandGroup heading={t('home.search.results')}>
                  {users.map(user => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => select(user.id)}
                      className="min-h-14 gap-3 rounded-xl px-2 py-2"
                    >
                      <AdminAvatar user={user} className="size-9" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body font-bold">{user.alias}</span>
                        <span className="block truncate text-caption text-muted-foreground">
                          {user.email}
                        </span>
                      </span>
                      <span className="flex shrink-0 gap-1">
                        <AdminUserBadges user={user} />
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};
