import { useCallback, useState } from 'react';
import { useServiceStore } from '../../store/service.store';
import type { UpdateServiceInput } from '../../types';

export function useUpdateService(exchangeRate: number | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateService = useServiceStore((s) => s.updateService);

  const submit = useCallback(
    async (id: string, data: UpdateServiceInput) => {
      if (!exchangeRate) throw new Error('No hay tasa BCV disponible');
      setIsSubmitting(true);
      try {
        await updateService(id, data, exchangeRate);
      } finally {
        setIsSubmitting(false);
      }
    },
    [exchangeRate, updateService],
  );

  return { submit, isSubmitting };
}
