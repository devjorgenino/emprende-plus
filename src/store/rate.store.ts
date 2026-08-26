import { create } from 'zustand';
import { getObject, setObject } from '../lib/storage';

const CACHE_KEY = 'bcv_exchange_rate';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

interface CachedRate {
  rate: number;
  fetchedAt: string;
  source: 'bcv' | 'manual' | 'cached';
}

type RateSource = 'bcv' | 'manual' | 'cached';

interface RateState {
  rate: number | null;
  source: RateSource | null;
  fetchedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

interface RateActions {
  fetchRate: () => Promise<number | null>;
  loadRate: () => Promise<void>;
  setManualRate: (rate: number) => Promise<void>;
  refresh: () => Promise<void>;
  startPolling: () => () => void;
}

export const useRateStore = create<RateState & RateActions>((set, get) => ({
  rate: null,
  source: null,
  fetchedAt: null,
  isLoading: false,
  error: null,

  fetchRate: async (): Promise<number | null> => {
    const apis: { url: string; extract: (data: unknown) => number | null }[] = [
      // DolarFlow — actualizado hoy 24/6 a las 1:30 PM (más fresco)
      {
        url: 'https://dolarflow.com/api/oficial/',
        extract: (d: any) => (typeof d?.precio === 'number' ? d.precio : null),
      },
      // BCV Today — tasa efectiva del BCV, via GitHub Pages
      {
        url: 'https://bcv.today/api/v1/rate.json',
        extract: (d: any) => (typeof d?.USD === 'number' ? d.USD : null),
      },
      // DolarApi.com — open source
      {
        url: 'https://ve.dolarapi.com/v1/dolares/oficial',
        extract: (d: any) => (typeof d?.promedio === 'number' ? d.promedio : null),
      },
      // rafnixg — actualmente caída, pero la dejamos como último intento
      {
        url: 'https://bcv-api.rafnixg.dev/v1/exchange-rates/latest/USD',
        extract: (d: any) => d?.rate ?? d?.rates?.USD?.rate ?? d?.USD?.rate ?? null,
      },
    ];

    for (const api of apis) {
      try {
        const res = await fetch(api.url);
        const data = await res.json();
        const rate = api.extract(data);
        if (typeof rate === 'number' && rate > 0) {
          return rate;
        }
      } catch {
        // intentar siguiente API
      }
    }
    return null;
  },

  loadRate: async () => {
    set({ isLoading: true, error: null });

    // Mostrar cache inmediatamente para primer pintado rápido
    const cached = await getObject<CachedRate>(CACHE_KEY);
    if (cached) {
      set({ rate: cached.rate, source: cached.source, fetchedAt: cached.fetchedAt, isLoading: false });
    }

    // Siempre intentar fetch en background (salta cache fresco)
    try {
      const apiRate = await get().fetchRate();
      if (apiRate !== null) {
        const now = new Date().toISOString();
        const entry: CachedRate = { rate: apiRate, fetchedAt: now, source: 'bcv' };
        await setObject(CACHE_KEY, entry);
        // No sobrescribir si el usuario puso una tasa manual
        if (get().source === 'manual') return;
        set({ rate: apiRate, source: 'bcv', fetchedAt: now, isLoading: false, error: null });
        return;
      }

      // Todas las APIs fallaron
      if (!cached) {
        set({ rate: null, source: null, fetchedAt: null, isLoading: false, error: 'No se pudo obtener la tasa BCV de ninguna fuente. Ingresa la tasa manualmente.' });
      } else {
        set({ error: 'Usando tasa cacheada. Conéctate para actualizar.' });
      }
    } catch {
      if (!cached) {
        set({ isLoading: false, error: 'Error al obtener la tasa de cambio' });
      }
    }
  },

  setManualRate: async (rate: number) => {
    const now = new Date().toISOString();
    const entry: CachedRate = { rate, fetchedAt: now, source: 'manual' };
    await setObject(CACHE_KEY, entry);
    set({ rate, source: 'manual', fetchedAt: now, error: null, isLoading: false });
  },

  refresh: async () => {
    const { loadRate } = get();
    await loadRate();
  },

  startPolling: () => {
    // Cada hora intenta refrescar la tasa en background
    const interval = setInterval(() => {
      get().loadRate();
    }, CACHE_TTL_MS);
    return () => clearInterval(interval);
  },
}));

export type { RateSource };
