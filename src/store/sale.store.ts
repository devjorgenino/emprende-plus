import { create } from 'zustand';
import * as saleRepository from '../services/db/repositories/sale.repository';
import * as quoteRepository from '../services/db/repositories/quote.repository';
import type { Quote, Sale, PaymentMethod } from '../types';
import { generateId } from '../utils/id';

function now(): string {
  return new Date().toISOString();
}

type SaleError = string | null;

interface SaleState {
  sales: Sale[];
  isLoading: boolean;
  error: SaleError;
}

interface SaleActions {
  loadSales: () => Promise<void>;
  createSaleFromQuote: (quote: Quote, paymentMethod: PaymentMethod) => Promise<string>;
  createSale: (sale: Sale) => Promise<void>;
  updateSale: (sale: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  getSaleById: (id: string) => Sale | undefined;
  getSalesInRange: (startDate: string, endDate: string) => Sale[];
  searchSales: (query: string) => Sale[];
  getTotalUSDInRange: (startDate: string, endDate: string) => number;
  getTotalVESInRange: (startDate: string, endDate: string) => number;
}

export const useSaleStore = create<SaleState & SaleActions>((set, get) => ({
  sales: [],
  isLoading: false,
  error: null,

  loadSales: async () => {
    set({ isLoading: true, error: null });
    try {
      const sales = saleRepository.getAllSales();
      set({ sales, isLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al cargar ventas';
      set({ error: message, isLoading: false });
    }
  },

  createSaleFromQuote: async (quote: Quote, paymentMethod: PaymentMethod) => {
    set({ isLoading: true, error: null });
    try {
      const sale: Sale = {
        id: generateId(),
        quoteId: quote.id,
        items: [...quote.items],
        totalUSD: quote.totalUSD,
        totalVES: quote.totalVES,
        exchangeRate: quote.exchangeRate,
        clientName: quote.clientName || 'Servicio de Papeleria',
        paymentMethod,
        notes: quote.notes,
        createdAt: now(),
      };
      saleRepository.createSale(sale);
      quoteRepository.updateQuoteStatus(quote.id, 'accepted');
      set((state) => ({
        sales: [sale, ...state.sales],
        isLoading: false,
      }));
      return sale.id;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al registrar venta';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  createSale: async (sale: Sale) => {
    set({ isLoading: true, error: null });
    try {
      saleRepository.createSale(sale);
      set((state) => ({
        sales: [sale, ...state.sales],
        isLoading: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al crear venta';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  updateSale: async (sale: Sale) => {
    set({ isLoading: true, error: null });
    try {
      saleRepository.updateSale(sale);
      set((state) => ({
        sales: state.sales.map((s) => (s.id === sale.id ? sale : s)),
        isLoading: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al actualizar venta';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  deleteSale: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      saleRepository.deleteSale(id);
      set((state) => ({
        sales: state.sales.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al eliminar venta';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  getSaleById: (id: string) => {
    return get().sales.find((s) => s.id === id) ?? saleRepository.getSaleById(id);
  },

  getSalesInRange: (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return get().sales.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= start && t <= end;
    });
  },

  searchSales: (query: string) => {
    const q = query.toLowerCase();
    return get().sales.filter(
      (s) => s.clientName?.toLowerCase().includes(q)
    );
  },

  getTotalUSDInRange: (startDate: string, endDate: string) => {
    return get()
      .getSalesInRange(startDate, endDate)
      .reduce((sum, s) => sum + s.totalUSD, 0);
  },

  getTotalVESInRange: (startDate: string, endDate: string) => {
    return get()
      .getSalesInRange(startDate, endDate)
      .reduce((sum, s) => sum + s.totalVES, 0);
  },
}));
