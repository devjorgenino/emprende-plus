import { type ReactNode } from 'react';
import { useToastStore } from '../../store/toast.store';
import { Toast } from '../ui/Toast';

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Renderiza el toast global desde el store de Zustand.
 * Se monta una sola vez en el layout raíz; cualquier pantalla
 * puede llamar `useToastStore.getState().showToast(msg, type)`.
 * La `key` fuerza un remontaje del Toast por cada mensaje nuevo
 * para reiniciar su animación de entrada/salida.
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const toast = useToastStore((s) => s.toast);
  const hideToast = useToastStore((s) => s.hideToast);

  return (
    <>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          visible
          onHide={hideToast}
        />
      )}
    </>
  );
}
