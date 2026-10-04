import { create } from 'zustand';
import * as quoteRepository from '../services/db/repositories/quote.repository';
import type { Quote, QuoteItem, Service } from '../types';
import { generateId } from '../utils/id';
import { useDraftQuoteStore } from './draft-quote.store';

function now(): string {
  return new Date().toISOString();
}

interface QuoteState {
  items: QuoteItem[];
  clientName: string;
  notes: string;
}

interface QuoteActions {
  addItem: (service: Pick<Service, 'id' | 'name' | 'priceUSD'>) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  setClientName: (name: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
  saveQuote: (
    exchangeRate: number,
    exchangeRateDate: string,
  ) => Promise<string>;
}

export const useQuoteStore = create<QuoteState & QuoteActions>((set, get) => ({
  items: [],
  clientName: '',
  notes: '',

  addItem: (service: Pick<Service, 'id' | 'name' | 'priceUSD'>) => {
    const existing = get().items.find((i) => i.serviceId === service.id);
    if (existing) {
      get().updateQuantity(service.id, existing.quantity + 1);
      return;
    }
    const newItem: QuoteItem = {
      serviceId: service.id,
      serviceName: service.name,
      priceUSD: service.priceUSD,
      quantity: 1,
      subtotalUSD: service.priceUSD,
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  removeItem: (serviceId: string) => {
    set((state) => ({
      items: state.items.filter((i) => i.serviceId !== serviceId),
    }));
  },

  updateQuantity: (serviceId: string, quantity: number) => {
    const clamped = Math.max(1, Math.min(999, quantity));
    set((state) => ({
      items: state.items.map((i) =>
        i.serviceId === serviceId
          ? {
              ...i,
              quantity: clamped,
              subtotalUSD: Math.round(i.priceUSD * clamped * 100) / 100,
            }
          : i,
      ),
    }));
  },

  setClientName: (name: string) => set({ clientName: name }),
  setNotes: (notes: string) => set({ notes }),
  reset: () => set({ items: [], clientName: '', notes: '' }),

  saveQuote: async (exchangeRate: number, exchangeRateDate: string) => {
    const state = get();
    const totalUSD = state.items.reduce((sum, i) => sum + i.subtotalUSD, 0);
    const totalVES = Math.round(totalUSD * exchangeRate * 100) / 100;

    const quote: Quote = {
      id: generateId(),
      items: state.items,
      totalUSD,
      totalVES,
      exchangeRate,
      exchangeRateDate,
      clientName: state.clientName || 'Servicio de Papeleria',
      notes: state.notes || undefined,
      status: 'draft',
      createdAt: now(),
    };

    quoteRepository.saveQuote(quote);
    useDraftQuoteStore.getState().clearDraft();
    set({ items: [], clientName: '', notes: '' });
    return quote.id;
  },
}));
