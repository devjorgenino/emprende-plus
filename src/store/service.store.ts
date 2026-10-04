import { create } from 'zustand';
import type { Service, CreateServiceInput, UpdateServiceInput } from '../types';
import * as serviceRepository from '../services/db/repositories/service.repository';
import { generateId } from '../utils/id';

function now(): string {
  return new Date().toISOString();
}

type ServiceError = string | null;

interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: ServiceError;
}

interface ServiceActions {
  loadServices: () => Promise<void>;
  createService: (
    data: CreateServiceInput,
    exchangeRate: number,
  ) => Promise<void>;
  updateService: (
    id: string,
    data: UpdateServiceInput,
    exchangeRate: number,
  ) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  getServiceById: (id: string) => Service | undefined;
}

export const useServiceStore = create<ServiceState & ServiceActions>(
  (set, get) => ({
    services: [],
    isLoading: false,
    error: null,

    loadServices: async () => {
      set({ isLoading: true, error: null });
      try {
        const services = serviceRepository.getAllServices();
        set({ services, isLoading: false });
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error al cargar servicios';
        set({ error: message, isLoading: false });
      }
    },

    createService: async (data: CreateServiceInput, exchangeRate: number) => {
      set({ isLoading: true, error: null });
      try {
        const service: Service = {
          id: generateId(),
          name: data.name,
          description: data.description,
          priceUSD: data.priceUSD,
          priceVES: Math.round(data.priceUSD * exchangeRate * 100) / 100,
          isActive: true,
          createdAt: now(),
          updatedAt: now(),
        };
        serviceRepository.createService(service);
        set((state) => ({
          services: [service, ...state.services],
          isLoading: false,
        }));
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error al crear servicio';
        set({ error: message, isLoading: false });
        throw e;
      }
    },

    updateService: async (
      id: string,
      data: UpdateServiceInput,
      exchangeRate: number,
    ) => {
      set({ isLoading: true, error: null });
      try {
        const existing = serviceRepository.getServiceById(id);
        if (!existing) {
          throw new Error('Servicio no encontrado');
        }
        const priceUSD = data.priceUSD ?? existing.priceUSD;
        const updated: Service = {
          ...existing,
          ...data,
          priceUSD,
          priceVES: Math.round(priceUSD * exchangeRate * 100) / 100,
          updatedAt: now(),
        };
        serviceRepository.updateService(updated);
        set((state) => ({
          services: state.services.map((s) => (s.id === id ? updated : s)),
          isLoading: false,
        }));
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error al actualizar servicio';
        set({ error: message, isLoading: false });
        throw e;
      }
    },

    deleteService: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        serviceRepository.deleteService(id);
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
          isLoading: false,
        }));
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error al eliminar servicio';
        set({ error: message, isLoading: false });
        throw e;
      }
    },

    getServiceById: (id: string) => {
      return (
        get().services.find((s) => s.id === id) ??
        serviceRepository.getServiceById(id)
      );
    },
  }),
);
