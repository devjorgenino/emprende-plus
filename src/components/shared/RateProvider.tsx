import { useEffect, type ReactNode } from 'react';
import { useRateStore } from '../../store/rate.store';

interface RateProviderProps {
  children: ReactNode;
}

export function RateProvider({ children }: RateProviderProps) {
  const loadRate = useRateStore((s) => s.loadRate);
  const startPolling = useRateStore((s) => s.startPolling);

  useEffect(() => {
    loadRate();
  }, [loadRate]);

  useEffect(() => {
    const stopPolling = startPolling();
    return stopPolling;
  }, [startPolling]);

  return <>{children}</>;
}
