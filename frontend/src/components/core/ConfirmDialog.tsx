import { useEffect } from 'react';
import useConfirmStore from '../../store/confirmStore';

/**
 * Global Confirm Dialog — mount once in App.tsx (alongside ToastContainer).
 * Replaces all window.confirm() calls with a beautiful Material 3 modal.
 */
export default function ConfirmDialog() {
  const { isOpen, title, message, confirmLabel, cancelLabel, variant, accept, cancel } = useConfirmStore();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, cancel]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const iconMap = {
    danger: { icon: 'warning', bg: 'bg-error-container', text: 'text-error' },
    warning: { icon: 'help', bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
    info: { icon: 'info', bg: 'bg-primary-container', text: 'text-primary' },
  };

  const { icon, bg, text } = iconMap[variant];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: 'fadeIn 150ms ease-out' }}
        onClick={cancel}
      />

      {/* Dialog */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 bg-surface-container-lowest rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 200ms ease-out' }}
      >
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-full ${bg} ${text} flex items-center justify-center mx-auto mb-4`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-headline font-bold text-on-surface mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{message}</p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={cancel}
              className="flex-1 px-4 py-2.5 rounded-full bg-surface-container text-on-surface font-bold text-sm hover:bg-surface-container-high transition-colors active:scale-95"
            >
              {cancelLabel}
            </button>
            <button
              onClick={accept}
              className={`flex-1 px-4 py-2.5 rounded-full font-bold text-sm transition-colors active:scale-95 ${
                variant === 'danger'
                  ? 'bg-error text-on-error hover:bg-error/90'
                  : 'bg-primary text-on-primary hover:bg-primary/90'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
