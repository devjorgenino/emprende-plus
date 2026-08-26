import { useEffect } from 'react';
import { useRateStore } from '../store/rate.store';

export function useExchangeRate() {
  const rate = useRateStore((s) => s.rate);
  const isLoading = useRateStore((s) => s.isLoading);
  const error = useRateStore((s) => s.error);
  const loadRate = useRateStore((s) => s.loadRate);
  const refresh = useRateStore((s) => s.refresh);

  useEffect(() => {
    loadRate();
  }, [loadRate]);

  return { rate, isLoading, error, refresh };
}
