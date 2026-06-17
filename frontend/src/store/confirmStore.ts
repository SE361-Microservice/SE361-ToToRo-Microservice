import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'danger' | 'warning' | 'info';
  resolve: ((value: boolean) => void) | null;
  confirm: (opts: {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
  }) => Promise<boolean>;
  accept: () => void;
  cancel: () => void;
}

const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  title: 'Xác nhận',
  message: '',
  confirmLabel: 'Xác nhận',
  cancelLabel: 'Hủy',
  variant: 'danger',
  resolve: null,

  confirm: (opts) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title: opts.title ?? 'Xác nhận',
        message: opts.message,
        confirmLabel: opts.confirmLabel ?? 'Xác nhận',
        cancelLabel: opts.cancelLabel ?? 'Hủy',
        variant: opts.variant ?? 'danger',
        resolve,
      });
    });
  },

  accept: () => {
    get().resolve?.(true);
    set({ isOpen: false, resolve: null });
  },

  cancel: () => {
    get().resolve?.(false);
    set({ isOpen: false, resolve: null });
  },
}));

export default useConfirmStore;
