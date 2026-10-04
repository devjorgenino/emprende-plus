import { create } from 'zustand';
import { getObject, setObject, removeKey } from '../lib/storage';
import type { QuoteItem } from '../types';

const DRAFT_KEY = 'draft_quote';

interface DraftQuoteState {
  items: QuoteItem[];
  clientName: string;
  notes: string;
}

interface DraftQuoteActions {
  loadDraft: () => Promise<void>;
  saveDraft: () => Promise<void>;
  clearDraft: () => Promise<void>;
  reset: () => void;
}

export const useDraftQuoteStore = create<DraftQuoteState & DraftQuoteActions>((set, get) => ({
  items: [],
  clientName: '',
  notes: '',

  loadDraft: async () => {
    const draft = await getObject<DraftQuoteState>(DRAFT_KEY);
    if (draft) {
      set(draft);
    }
  },

  saveDraft: async () => {
    const state = get();
    await setObject(DRAFT_KEY, {
      items: state.items,
      clientName: state.clientName,
      notes: state.notes,
    });
  },

  clearDraft: async () => {
    set({ items: [], clientName: '', notes: '' });
    await removeKey(DRAFT_KEY);
  },

  reset: () => set({ items: [], clientName: '', notes: '' }),
}));
