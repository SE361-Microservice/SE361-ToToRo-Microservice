import useToastStore from '../store/toastStore';

// ── useToast hook ────────────────────────────────────────────────────
// Convenience wrapper for showing toast notifications anywhere.
//
// Usage:
//   const toast = useToast();
//   toast.success('Cập nhật thành công!');
//   toast.error('Có lỗi xảy ra.');
//   toast.warning('Mật khẩu quá yếu.');
//   toast.info('Đang xử lý…');

export function useToast() {
  const addToast = useToastStore((s) => s.addToast);

  return {
    success: (message: string, duration?: number) => addToast('success', message, duration),
    error: (message: string, duration?: number) => addToast('error', message, duration),
    warning: (message: string, duration?: number) => addToast('warning', message, duration),
    info: (message: string, duration?: number) => addToast('info', message, duration),
  };
}

// Non-hook version for use outside React components (e.g. in services)
export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast('success', message, duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast('error', message, duration),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().addToast('warning', message, duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast('info', message, duration),
};
