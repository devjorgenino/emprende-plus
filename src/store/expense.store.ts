import { create } from 'zustand';
import * as expenseRepository from '../services/db/repositories/expense.repository';
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from '../types';
import { generateId } from '../utils/id';

function now(): string {
  return new Date().toISOString();
}

type ExpenseError = string | null;

interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: ExpenseError;
}

interface ExpenseActions {
  loadExpenses: () => Promise<void>;
  createExpense: (
    data: CreateExpenseInput,
    exchangeRate: number,
  ) => Promise<string>;
  updateExpense: (
    id: string,
    data: UpdateExpenseInput,
    exchangeRate: number,
  ) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpenseById: (id: string) => Expense | undefined;
  getExpensesInRange: (startDate: string, endDate: string) => Expense[];
  searchExpenses: (query: string) => Expense[];
  getTotalUSDInRange: (startDate: string, endDate: string) => number;
  getTotalVESInRange: (startDate: string, endDate: string) => number;
}

export const useExpenseStore = create<ExpenseState & ExpenseActions>(
  (set, get) => ({
    expenses: [],
    isLoading: false,
    error: null,

    loadExpenses: async () => {
      set({ isLoading: true, error: null });
      try {
        const expenses = expenseRepository.getAllExpenses();
        set({ expenses, isLoading: false });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error al cargar egresos';
        set({ error: message, isLoading: false });
      }
    },

    createExpense: async (data: CreateExpenseInput, exchangeRate: number) => {
      set({ isLoading: true, error: null });
      try {
        const amountVES = Math.round(data.amountUSD * exchangeRate * 100) / 100;
        const expense: Expense = {
          id: generateId(),
          description: data.description,
          category: data.category,
          amountUSD: data.amountUSD,
          amountVES,
          exchangeRate,
          paymentMethod: data.paymentMethod,
          supplier: data.supplier,
          notes: data.notes,
          createdAt: now(),
        };
        expenseRepository.createExpense(expense);
        set((state) => ({
          expenses: [expense, ...state.expenses],
          isLoading: false,
        }));
        return expense.id;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error al crear egreso';
        set({ error: message, isLoading: false });
        throw e;
      }
    },

    updateExpense: async (
      id: string,
      data: UpdateExpenseInput,
      exchangeRate: number,
    ) => {
      set({ isLoading: true, error: null });
      try {
        const existing = expenseRepository.getExpenseById(id);
        if (!existing) throw new Error('Egreso no encontrado');

        const amountUSD = data.amountUSD ?? existing.amountUSD;
        const amountVES = Math.round(amountUSD * exchangeRate * 100) / 100;
        const updated: Expense = {
          ...existing,
          ...data,
          amountUSD,
          amountVES,
          exchangeRate,
        };
        expenseRepository.updateExpense(updated);
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
          isLoading: false,
        }));
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error al actualizar egreso';
        set({ error: message, isLoading: false });
        throw e;
      }
    },

    deleteExpense: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        expenseRepository.deleteExpense(id);
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
          isLoading: false,
        }));
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error al eliminar egreso';
        set({ error: message, isLoading: false });
        throw e;
      }
    },

    getExpenseById: (id: string) => {
      return (
        get().expenses.find((e) => e.id === id) ??
        expenseRepository.getExpenseById(id)
      );
    },

    getExpensesInRange: (startDate: string, endDate: string) => {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return get().expenses.filter((e) => {
        const t = new Date(e.createdAt).getTime();
        return t >= start && t <= end;
      });
    },

    searchExpenses: (query: string) => {
      const q = query.toLowerCase();
      return get().expenses.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.supplier?.toLowerCase().includes(q),
      );
    },

    getTotalUSDInRange: (startDate: string, endDate: string) => {
      return get()
        .getExpensesInRange(startDate, endDate)
        .reduce((sum, e) => sum + e.amountUSD, 0);
    },

    getTotalVESInRange: (startDate: string, endDate: string) => {
      return get()
        .getExpensesInRange(startDate, endDate)
        .reduce((sum, e) => sum + e.amountVES, 0);
    },
  }),
);
