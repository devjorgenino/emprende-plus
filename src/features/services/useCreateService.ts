import { useCallback, useState } from 'react';
import { useServiceStore } from '../../store/service.store';
import type { CreateServiceInput } from '../../types';

export function useCreateService(exchangeRate: number | null) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createService = useServiceStore((s) => s.createService);

  const submit = useCallback(
    async (data: CreateServiceInput) => {
      if (!exchangeRate) throw new Error('No hay tasa BCV disponible');
      setIsSubmitting(true);
      try {
        await createService(data, exchangeRate);
      } finally {
        setIsSubmitting(false);
      }
    },
    [exchangeRate, createService],
  );

  return { submit, isSubmitting };
}
