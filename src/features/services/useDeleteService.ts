import { useCallback, useState } from 'react';
import { useServiceStore } from '../../store/service.store';

export function useDeleteService() {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteService = useServiceStore((s) => s.deleteService);

  const remove = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      try {
        await deleteService(id);
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteService],
  );

  return { remove, isDeleting };
}
