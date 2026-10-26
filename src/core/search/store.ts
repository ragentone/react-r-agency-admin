import { create } from 'zustand';

interface ISearchUiStore {
  open: boolean;
  /** Current term – kept after closing, so reopening shows the same search. */
  term: string;
  setOpen: (open: boolean, term?: string) => void;
  setTerm: (term: string) => void;
}

export const useSearchUi = create<ISearchUiStore>(set => ({
  open: false,
  term: '',
  // A given term replaces the kept one (e.g. "search for …" links); otherwise it stays.
  setOpen: (open, term) => set(state => ({ open, term: term ?? state.term })),
  setTerm: term => set({ term }),
}));
