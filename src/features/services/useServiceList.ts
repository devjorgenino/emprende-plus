import { useCallback, useEffect } from 'react';
import { useServiceStore } from '../../store/service.store';

export function useServiceList() {
  const services = useServiceStore((s) => s.services);
  const isLoading = useServiceStore((s) => s.isLoading);
  const error = useServiceStore((s) => s.error);
  const loadServices = useServiceStore((s) => s.loadServices);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const refresh = useCallback(() => {
    loadServices();
  }, [loadServices]);

  return { services, isLoading, error, refresh };
}
