import { create } from 'zustand';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: Math.random().toString(36).substring(2, 9),
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function useToast() {
  const { addToast, removeToast } = useToastStore();

  const showToast = ({
    title,
    description,
    type = 'info',
    duration = 5000,
  }: Omit<Toast, 'id'>) => {
    const id = addToast({ title, description, type, duration });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id as unknown as string);
      }, duration);
    }
  };

  return { showToast };
}
