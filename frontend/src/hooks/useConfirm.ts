import useConfirmStore from '../store/confirmStore';

/**
 * Hook to show a confirm dialog (replaces window.confirm).
 *
 * Usage:
 *   const confirm = useConfirm();
 *   const ok = await confirm({ message: 'Xóa bài viết này?' });
 *   if (ok) { ... }
 */
export function useConfirm() {
  const confirmFn = useConfirmStore((s) => s.confirm);
  return confirmFn;
}
