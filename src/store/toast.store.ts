import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastState {
  toast: ToastMessage | null;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

let counter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,

  showToast: (message: string, type: ToastType = 'success') => {
    counter += 1;
    set({ toast: { id: counter, message, type } });
  },

  hideToast: () => set({ toast: null }),
}));
