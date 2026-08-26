import { create } from 'zustand';
import * as inventoryRepository from '../services/db/repositories/inventory.repository';
import type { InventoryItem } from '../types';
import { generateId } from '../utils/id';

function now(): string {
  return new Date().toISOString();
}

export interface CreateInventoryInput {
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  purchasePriceUSD: number;
  supplier?: string;
  purchaseDate: string;
  notes?: string;
  photoUri?: string;
  lowStockThreshold?: number;
}

export interface UpdateInventoryInput {
  name?: string;
  description?: string;
  category?: string;
  quantity?: number;
  unit?: string;
  purchasePriceUSD?: number;
  supplier?: string;
  purchaseDate?: string;
  notes?: string;
  photoUri?: string;
  lowStockThreshold?: number;
}

type InventoryError = string | null;

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: InventoryError;
}

interface InventoryActions {
  loadItems: () => Promise<void>;
  createItem: (data: CreateInventoryInput, exchangeRate: number) => Promise<void>;
  updateItem: (id: string, data: UpdateInventoryInput, exchangeRate: number) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => InventoryItem | undefined;
}

export const useInventoryStore = create<InventoryState & InventoryActions>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  loadItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = inventoryRepository.getAllItems();
      set({ items, isLoading: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al cargar inventario';
      set({ error: message, isLoading: false });
    }
  },

  createItem: async (data: CreateInventoryInput, exchangeRate: number) => {
    set({ isLoading: true, error: null });
    try {
      const item: InventoryItem = {
        id: generateId(),
        name: data.name,
        description: data.description,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        purchasePriceUSD: data.purchasePriceUSD,
        purchasePriceVES: Math.round(data.purchasePriceUSD * exchangeRate * 100) / 100,
        exchangeRateAtPurchase: exchangeRate,
        supplier: data.supplier,
        purchaseDate: data.purchaseDate,
        notes: data.notes,
        photoUri: data.photoUri,
        lowStockThreshold: data.lowStockThreshold,
        createdAt: now(),
      };
      inventoryRepository.createItem(item);
      set((state) => ({
        items: [item, ...state.items],
        isLoading: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al crear item';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  updateItem: async (id: string, data: UpdateInventoryInput, exchangeRate: number) => {
    set({ isLoading: true, error: null });
    try {
      const existing = inventoryRepository.getItemById(id);
      if (!existing) throw new Error('Item no encontrado');
      const purchasePriceUSD = data.purchasePriceUSD ?? existing.purchasePriceUSD;
      const updated: InventoryItem = {
        ...existing,
        ...data,
        purchasePriceUSD,
        purchasePriceVES: Math.round(purchasePriceUSD * exchangeRate * 100) / 100,
        exchangeRateAtPurchase: exchangeRate,
      };
      inventoryRepository.updateItem(updated);
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updated : i)),
        isLoading: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al actualizar item';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  deleteItem: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      inventoryRepository.deleteItem(id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        isLoading: false,
      }));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al eliminar item';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  getItemById: (id: string) => {
    return get().items.find((i) => i.id === id) ?? inventoryRepository.getItemById(id);
  },
}));
